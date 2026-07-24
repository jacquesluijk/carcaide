<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { User, Post } from '$lib/types';
  import { adminServices } from '$lib/types';

  let pendingUsers: User[] = [];
  let approvedUsers: User[] = [];
  let allPosts: Post[] = [];
  let loading = true;
  let activeTab = 'users';

  // Admin services form
  let serviceTitle = '';
  let serviceDescription = '';
  let serviceCategory = '';
  let servicePrice: number | undefined;
  let serviceMedia: File[] = [];
  let uploadingService = false;

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      await goto('/auth/login');
      return;
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      await goto('/');
      return;
    }

    await fetchPendingUsers();
    await fetchApprovedUsers();
    await fetchAllPosts();
    loading = false;
  });

  async function fetchPendingUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (data) {
      pendingUsers = data;
    }
  }

  async function fetchApprovedUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) {
      approvedUsers = data;
    }
  }

  async function fetchAllPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(name, email, role)')
      .order('created_at', { ascending: false });

    if (data) {
      allPosts = data.map(post => ({
        ...post,
        user: post.user || null,
      }));
    }
  }

  async function approveUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (!error) {
      await fetchPendingUsers();
      await fetchApprovedUsers();
    }
  }

  async function rejectUser(userId: string) {
    // Delete user from auth and users table
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (!authError && !dbError) {
      await fetchPendingUsers();
    }
  }

  async function deletePost(postId: string) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      await fetchAllPosts();
    }
  }

  async function handleCreateService() {
    if (!serviceTitle || !serviceDescription || !serviceCategory) {
      alert('Vul alle verplichte velden in');
      return;
    }

    uploadingService = true;

    // Upload media if any
    let mediaUrls: string[] = [];
    if (serviceMedia.length > 0) {
      for (const file of serviceMedia) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `services/${fileName}`;

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) {
          alert('Fout bij uploaden van media');
          uploadingService = false;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: serviceTitle,
        description: serviceDescription,
        category: 'diensten',
        subcategory: serviceCategory,
        price: servicePrice,
        is_active: true,
      });

    if (error) {
      alert('Fout bij aanmaken van dienst');
      uploadingService = false;
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
    serviceTitle = '';
    serviceDescription = '';
    serviceCategory = '';
    servicePrice = undefined;
    serviceMedia = [];
    uploadingService = false;

    await fetchAllPosts();
    alert('Dienst succesvol toegevoegd!');
  }

  function handleMediaUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      serviceMedia = Array.from(input.files).slice(0, 5); // Max 5 files
    }
  }
</script>

<svelte:head>
  <title>Carcaide - Admin Dashboard</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
  <h1 class="text-3xl font-bold text-primary-dark mb-8">Admin Dashboard</h1>

  <!-- Tabs -->
  <div class="flex space-x-4 mb-6 border-b">
    <button 
      on:click={() => activeTab = 'users'}
      class={`pb-2 px-4 font-medium {
        activeTab === 'users' 
          ? 'text-primary-orange border-b-2 border-primary-orange' 
          : 'text-gray-500 hover:text-primary-orange'
      }`}
    >
      Gebruikers
    </button>
    <button 
      on:click={() => activeTab = 'posts'}
      class={`pb-2 px-4 font-medium {
        activeTab === 'posts' 
          ? 'text-primary-orange border-b-2 border-primary-orange' 
          : 'text-gray-500 hover:text-primary-orange'
      }`}
    >
      Posts
    </button>
    <button 
      on:click={() => activeTab = 'services'}
      class={`pb-2 px-4 font-medium {
        activeTab === 'services' 
          ? 'text-primary-orange border-b-2 border-primary-orange' 
          : 'text-gray-500 hover:text-primary-orange'
      }`}
    >
      Mijn Diensten
    </button>
  </div>

  <!-- Users Tab -->
  {#if activeTab === 'users'}
    <div>
      <h2 class="text-xl font-semibold mb-4">Wachtende gebruikers</h2>
      
      {#if loading}
        <p>Laden...</p>
      {:else if pendingUsers.length === 0}
        <p class="text-gray-500">Geen wachtende gebruikers.</p>
      {:else}
        <div class="space-y-4">
          {#each pendingUsers as user}
            <div class="card flex items-center justify-between">
              <div>
                <h3 class="font-semibold">{user.name}</h3>
                <p class="text-gray-600">{user.email}</p>
                <p class="text-sm text-gray-500">Rol: {user.role}</p>
              </div>
              <div class="flex space-x-2">
                <button 
                  on:click={() => approveUser(user.id)}
                  class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  Goedkeuren
                </button>
                <button 
                  on:click={() => rejectUser(user.id)}
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Afwijzen
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <h2 class="text-xl font-semibold mb-4 mt-8">Goedgekeurde gebruikers</h2>
      
      {#if approvedUsers.length === 0}
        <p class="text-gray-500">Geen goedgekeurde gebruikers.</p>
      {:else}
        <div class="space-y-4">
          {#each approvedUsers as user}
            <div class="card">
              <h3 class="font-semibold">{user.name}</h3>
              <p class="text-gray-600">{user.email}</p>
              <p class="text-sm text-gray-500">Rol: {user.role}</p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Posts Tab -->
  {#if activeTab === 'posts'}
    <div>
      <h2 class="text-xl font-semibold mb-4">Alle posts</h2>
      
      {#if loading}
        <p>Laden...</p>
      {:else if allPosts.length === 0}
        <p class="text-gray-500">Geen posts gevonden.</p>
      {:else}
        <div class="space-y-4">
          {#each allPosts as post}
            <div class="card">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold">{post.title}</h3>
                  <p class="text-gray-600">{post.description.slice(0, 100)}...</p>
                  <p class="text-sm text-gray-500">
                    Geplaatst door: {post.user?.name || 'Onbekend'} ({post.user?.role}) | 
                    {new Date(post.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                <button 
                  on:click={() => deletePost(post.id)}
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Services Tab -->
  {#if activeTab === 'services'}
    <div>
      <h2 class="text-xl font-semibold mb-4">Mijn Diensten Beheren</h2>
      
      <div class="card mb-6">
        <h3 class="text-lg font-semibold mb-4">Nieuwe dienst toevoegen</h3>
        
        <form on:submit|preventDefault={handleCreateService} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input 
              type="text" 
              bind:value={serviceTitle}
              class="input-field"
              placeholder="Bijv. Financieringsadvies"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
            <textarea 
              bind:value={serviceDescription}
              class="input-field h-32"
              placeholder="Beschrijf je dienst..."
              required
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
            <select bind:value={serviceCategory} class="input-field" required>
              <option value="">Selecteer een categorie</option>
              {#each adminServices as service}
                <option value={service.value}>{service.label}</option>
              {/each}
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prijs (optioneel)</label>
            <input 
              type="number" 
              bind:value={servicePrice}
              class="input-field"
              placeholder="€0.00"
              step="0.01"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Media (max 5 foto's/video's)</label>
            <input 
              type="file" 
              on:change={handleMediaUpload}
              multiple
              accept="image/*, video/*"
              class="input-field"
            />
            {#if serviceMedia.length > 0}
              <p class="text-sm text-gray-500 mt-1">
                {serviceMedia.length} bestand(en) geselecteerd
              </p>
            {/if}
          </div>

          <button 
            type="submit" 
            class="btn-primary"
            disabled={uploadingService}
          >
            {uploadingService ? 'Toevoegen...' : 'Dienst toevoegen'}
          </button>
        </form>
      </div>

      <h3 class="text-lg font-semibold mb-4">Mijn huidige diensten</h3>
      
      {#if loading}
        <p>Laden...</p>
      {:else}
        <div class="space-y-4">
          {#each allPosts.filter(p => p.category === 'diensten') as service}
            <div class="card">
              <h4 class="font-semibold">{service.title}</h4>
              <p class="text-gray-600">{service.description.slice(0, 100)}...</p>
              <p class="text-primary-orange font-medium">
                {service.price ? `€${service.price.toFixed(2)}` : 'Prijs op aanvraag'}
              </p>
              <button 
                on:click={() => deletePost(service.id)}
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 mt-2"
              >
                Verwijderen
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
