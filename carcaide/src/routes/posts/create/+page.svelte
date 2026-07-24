<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { categories, getAllowedCategories, getAllowedSubcategories, type PostCategory, type SubCategory } from '$lib/types';
  import { isAdminOnlyCategory } from '$lib/utils';
  import type { User } from '$lib/types';

  let user: User | null = null;
  let loading = true;
  let allowedCategories: PostCategory[] = [];

  // Post form
  let title = '';
  let description = '';
  let category: PostCategory = 'vraag_aanbod';
  let subcategory: SubCategory | '' = '';
  let price: number | undefined;
  let location = '';
  let media: File[] = [];
  let uploading = false;

  onMount(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (!supabaseUser) {
      await goto('/auth/login');
      return;
    }

    // Fetch user data
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (userData) {
      user = userData;
      allowedCategories = getAllowedCategories(userData.role as any);
      
      // Set default category based on user role
      if (userData.role === 'ondernemer') {
        category = 'vacatures';
      } else if (userData.role === 'admin') {
        category = 'diensten';
      }
    }

    loading = false;
  });

  $: if (category) {
    const subcats = getAllowedSubcategories(category);
    if (subcats.length > 0 && !subcats.includes(subcategory as SubCategory)) {
      subcategory = '';
    }
  }

  async function handleCreatePost() {
    if (!title || !description) {
      alert('Vul alle verplichte velden in');
      return;
    }

    if (isAdminOnlyCategory(category) && user?.role !== 'admin') {
      alert('Je hebt geen toegang tot deze categorie');
      return;
    }

    uploading = true;

    // Upload media if any
    let mediaUrls: string[] = [];
    if (media.length > 0) {
      for (const file of media) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) {
          alert('Fout bij uploaden van media');
          uploading = false;
          return;
        }

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        if (urlData.publicUrl) {
          mediaUrls.push(urlData.publicUrl);
        }
      }
    }

    // Create post
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user?.id,
        title,
        description,
        category,
        subcategory: subcategory || undefined,
        price,
        location,
        is_active: true,
      });

    if (error) {
      alert('Fout bij aanmaken van post');
      uploading = false;
      return;
    }

    // Get the post ID and add media
    const { data: postData } = await supabase
      .from('posts')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (postData && postData.length > 0 && mediaUrls.length > 0) {
      const mediaRecords = mediaUrls.map(url => ({
        post_id: postData[0].id,
        url,
        type: url.endsWith('.mp4') || url.endsWith('.webm') ? 'video' : 'image',
      }));

      await supabase
        .from('post_media')
        .insert(mediaRecords);
    }

    // Reset form
    title = '';
    description = '';
    category = 'vraag_aanbod';
    subcategory = '';
    price = undefined;
    location = '';
    media = [];
    uploading = false;

    alert('Post succesvol toegevoegd!');
    await goto('/');
  }

  function handleMediaUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      media = Array.from(input.files).slice(0, 5); // Max 5 files
    }
  }

  function getSubcategoriesForCategory(cat: PostCategory): { value: SubCategory; label: string }[] {
    const catConfig = categories.find(c => c.value === cat);
    if (catConfig?.subcategories) {
      return catConfig.subcategories.map(sc => ({
        value: sc.value,
        label: sc.label,
      }));
    }
    return [];
  }
</script>

<svelte:head>
  <title>Carcaide - Nieuwe Post</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
  {#if loading}
    <p>Laden...</p>
  {:else if !user}
    <p>Je moet ingelogd zijn om een post te maken.</p>
  {:else}
    <h1 class="text-3xl font-bold text-primary-dark mb-8">Nieuwe Post</h1>

    <form on:submit|preventDefault={handleCreatePost} class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
        <input
          type="text"
          id="title"
          bind:value={title}
          class="input-field"
          placeholder="Bijv. Mooie bank te koop"
          required
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
        <textarea
          id="description"
          bind:value={description}
          class="input-field h-32"
          placeholder="Beschrijf je post in detail..."
          required
        ></textarea>
      </div>

      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
        <select id="category" bind:value={category} class="input-field" required>
          <option value="">Selecteer een categorie</option>
          {#each allowedCategories as cat}
            <option value={cat}>{getCategoryLabel(cat)}</option>
          {/each}
        </select>
      </div>

      {#if getSubcategoriesForCategory(category).length > 0}
        <div>
          <label for="subcategory" class="block text-sm font-medium text-gray-700 mb-1">Subcategorie</label>
          <select id="subcategory" bind:value={subcategory} class="input-field">
            <option value="">Selecteer een subcategorie</option>
            {#each getSubcategoriesForCategory(category) as subcat}
              <option value={subcat.value}>{subcat.label}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if ['vraag_aanbod', 'ondernemers'].includes(category)}
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Prijs (optioneel)</label>
          <input
            type="number"
            id="price"
            bind:value={price}
            class="input-field"
            placeholder="€0.00"
            step="0.01"
          />
        </div>
      {/if}

      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Locatie (optioneel)</label>
        <input
          type="text"
          id="location"
          bind:value={location}
          class="input-field"
          placeholder="Bijv. Carcassonne"
        />
      </div>

      <div>
        <label for="media" class="block text-sm font-medium text-gray-700 mb-1">Media (max 5 foto's/video's)</label>
        <input
          type="file"
          id="media"
          on:change={handleMediaUpload}
          multiple
          accept="image/*, video/*"
          class="input-field"
        />
        {#if media.length > 0}
          <p class="text-sm text-gray-500 mt-1">{media.length} bestand(en) geselecteerd</p>
        {/if}
      </div>

      <button 
        type="submit" 
        class="btn-primary"
        disabled={uploading}
      >
        {uploading ? 'Posten...' : 'Post maken'}
      </button>
    </form>
  {/if}
</div>

<!-- Helper function -->
<script lang="ts">
  function getCategoryLabel(category: string): string {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  }
</script>
