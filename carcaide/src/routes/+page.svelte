<script lang="ts">
  import { categories, adminOnlyCategory } from '$lib/types';
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import type { Post } from '$lib/types';

  let posts: Post[] = [];
  let loading = true;
  let selectedCategory: string | null = null;

  onMount(async () => {
    await fetchPosts();
    loading = false;
  });

  async function fetchPosts(category?: string) {
    let query = supabase
      .from('posts')
      .select('*, user:users(name, profile_picture, phone), media:post_media(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (data) {
      posts = data.map(post => ({
        ...post,
        user: post.user || null,
        media: post.media || [],
      }));
    }
  }

  function handleCategorySelect(category: string | null) {
    selectedCategory = category;
    fetchPosts(category || undefined);
  }

  function getCategoryLabel(category: string): string {
    const found = categories.find(c => c.value === category);
    return found ? found.label : category;
  }
</script>

<svelte:head>
  <title>Carcaide - Home</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
  <h1 class="text-3xl font-bold text-primary-dark mb-8">Welkom bij Carcaide</h1>
  
  <p class="text-gray-600 mb-8">
    De marktplaats voor Carcassonne. Plaats en vind vacatures, spullen, hulp, en meer.
  </p>

  <!-- Category selection -->
  <div class="mb-8">
    <h2 class="text-xl font-semibold text-primary-dark mb-4">Categorieën</h2>
    <div class="category-grid">
      <button 
        on:click={() => handleCategorySelect(null)}
        class={`p-4 rounded-lg border-2 transition-colors {
          selectedCategory === null 
            ? 'border-primary-orange bg-orange-50' 
            : 'border-gray-200 hover:border-primary-orange'
        }`}
      >
        <span class="text-2xl">🏠</span>
        <p class="mt-2 font-medium">Alle</p>
      </button>

      {#each categories as category}
        <button 
          on:click={() => handleCategorySelect(category.value)}
          class={`p-4 rounded-lg border-2 transition-colors {
            selectedCategory === category.value 
              ? 'border-primary-orange bg-orange-50' 
              : 'border-gray-200 hover:border-primary-orange'
          }`}
        >
          <span class="text-2xl">{category.icon}</span>
          <p class="mt-2 font-medium">{category.label}</p>
        </button>
      {/each}

      {#if user?.role === 'admin'}
        <button 
          on:click={() => handleCategorySelect(adminOnlyCategory)}
          class={`p-4 rounded-lg border-2 transition-colors {
            selectedCategory === adminOnlyCategory 
              ? 'border-primary-orange bg-orange-50' 
              : 'border-gray-200 hover:border-primary-orange'
          }`}
        >
          <span class="text-2xl">🔒</span>
          <p class="mt-2 font-medium">Diensten</p>
        </button>
      {/if}
    </div>
  </div>

  <!-- Posts -->
  {#if loading}
    <div class="text-center py-8">
      <p class="text-gray-500">Laden...</p>
    </div>
  {:else if posts.length === 0}
    <div class="text-center py-8">
      <p class="text-gray-500">Geen posts gevonden in deze categorie.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each posts as post}
        <a 
          href="/posts/{post.id}"
          class="post-card block text-decoration-none text-primary-dark"
        >
          <div class="relative">
            {#if post.media && post.media.length > 0}
              <img 
                src={post.media[0].url} 
                alt={post.title}
                class="w-full h-48 object-cover"
              />
            {:else}
              <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span class="text-4xl">📷</span>
              </div>
            {/if}
            
            <span class="absolute top-2 right-2 bg-primary-orange text-white px-2 py-1 rounded text-sm">
              {getCategoryLabel(post.category)}
            </span>
          </div>
          
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1">{post.title}</h3>
            <p class="text-gray-600 text-sm mb-2">{post.description.slice(0, 100)}...</p>
            <p class="text-primary-orange font-medium">
              {post.price ? `€${post.price.toFixed(2)}` : 'Prijs op aanvraag'}
            </p>
            <p class="text-xs text-gray-500 mt-2">
              {new Date(post.created_at).toLocaleDateString('nl-NL')}
            </p>
          </div>
        </a>
      {/each}
    </div>
  {/if}

  <!-- Create post button -->
  <div class="mt-8 text-center">
    <a href="/posts/create" class="btn-primary inline-block">
      Nieuwe post maken
    </a>
  </div>
</div>
