<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import type { Post, Comment, User } from '$lib/types';
  import { formatDate, formatPrice } from '$lib/utils';

  let post: Post | null = null;
  let comments: (Comment & { user: { name: string; profile_picture?: string } })[] = [];
  let loading = true;
  let currentUser: User | null = null;
  let newComment = '';
  let submittingComment = false;

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        currentUser = userData;
      }
    }

    await fetchPost();
    await fetchComments();
    loading = false;
  });

  async function fetchPost() {
    const postId = $page.params.id;
    
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(name, profile_picture, phone, email), media:post_media(*)')
      .eq('id', postId)
      .single();

    if (data) {
      post = {
        ...data,
        user: data.user || null,
        media: data.media || [],
      };
    }
  }

  async function fetchComments() {
    const postId = $page.params.id;
    
    const { data, error } = await supabase
      .from('comments')
      .select('*, user:users(name, profile_picture)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (data) {
      comments = data.map(comment => ({
        ...comment,
        user: comment.user || { name: 'Onbekend' },
      }));
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || !currentUser) return;

    submittingComment = true;

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: $page.params.id,
        user_id: currentUser.id,
        content: newComment,
      });

    if (error) {
      alert('Fout bij plaatsen van reactie');
      submittingComment = false;
      return;
    }

    newComment = '';
    await fetchComments();
    submittingComment = false;
  }

  async function handleDeletePost() {
    if (!post || post.user_id !== currentUser?.id && currentUser?.role !== 'admin') {
      alert('Je hebt geen toestemming om deze post te verwijderen');
      return;
    }

    if (confirm('Weet je zeker dat je deze post wilt verwijderen?')) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (!error) {
        await goto('/');
      }
    }
  }

  function getCategoryLabel(category: string): string {
    const categoryMap: Record<string, string> = {
      'vacatures': 'Vacatures',
      'ondernemers': 'Ondernemers',
      'vraag_aanbod': 'Vraag & Aanbod',
      'evenementen': 'Evenementen',
      'samen_reizen': 'Samen Reizen',
      'diensten': 'Diensten',
    };
    return categoryMap[category] || category;
  }

  function getSubcategoryLabel(subcategory: string | undefined): string {
    if (!subcategory) return '';
    
    const subcategoryMap: Record<string, string> = {
      'auto': 'Auto\'s',
      'meubels': 'Meubels',
      'kleding': 'Kleding',
      'computers': 'Computers',
      'telefoons': 'Telefoons',
      'tv': 'TV\'s',
      'speelgoed': 'Speelgoed',
      'kinder_baby': 'Kinder & Baby',
      'financiering': 'Financiering',
      'woning_aankoop': 'Woning Aankoop',
      'woning_verkoop': 'Woning Verkoop',
      'vakantiewoning_verhuur': 'Verhuur Vakantiewoningen',
    };
    return subcategoryMap[subcategory] || subcategory;
  }
</script>

<svelte:head>
  <title>Carcaide - {post?.title || 'Post'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  {#if loading}
    <p>Laden...</p>
  {:else if !post}
    <p>Post niet gevonden.</p>
  {:else}
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <!-- Post header -->
      <div class="p-6 border-b">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div>
              {#if post.user?.profile_picture}
                <img 
                  src={post.user.profile_picture} 
                  alt="Profiel foto" 
                  class="w-12 h-12 rounded-full object-cover"
                />
              {:else}
                <div class="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center text-white font-bold">
                  {post.user?.name.charAt(0).toUpperCase() || '?'}
                </div>
              {/if}
            </div>
            <div>
              <h1 class="text-2xl font-bold text-primary-dark">{post.title}</h1>
              <p class="text-gray-600">
                Geplaatst door: <span class="font-medium">{post.user?.name || 'Onbekend'}</span>
              </p>
            </div>
          </div>
          
          {#if currentUser && (currentUser.id === post.user_id || currentUser.role === 'admin')}
            <button 
              on:click={handleDeletePost}
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Verwijderen
            </button>
          {/if}
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <span class="bg-primary-orange text-white px-3 py-1 rounded-full text-sm">
            {getCategoryLabel(post.category)}
          </span>
          {#if post.subcategory}
            <span class="bg-primary-blue text-white px-3 py-1 rounded-full text-sm">
              {getSubcategoryLabel(post.subcategory)}
            </span>
          {/if}
          {#if post.price !== undefined}
            <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
              {formatPrice(post.price)}
            </span>
          {/if}
          {#if post.location}
            <span class="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
              {post.location}
            </span>
          {/if}
        </div>
      </div>

      <!-- Post content -->
      <div class="p-6">
        <p class="text-gray-700 mb-6 whitespace-pre-line">{post.description}</p>

        <!-- Media -->
        {#if post.media && post.media.length > 0}
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2">Media</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each post.media as media}
                <div class="relative">
                  {#if media.type === 'video'}
                    <video controls class="w-full h-64 object-cover rounded-lg">
                      <source src={media.url} type="video/mp4" />
                      Je browser ondersteunt video niet.
                    </video>
                  {:else}
                    <img 
                      src={media.url} 
                      alt="Post afbeelding" 
                      class="w-full h-64 object-cover rounded-lg"
                    />
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Post metadata -->
        <div class="text-sm text-gray-500">
          Geplaatst op: {formatDate(post.created_at)}
        </div>

        <!-- User contact info -->
        {#if post.user && (post.user.phone || post.user.email || post.user.website || post.user.social_media)}
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-primary-dark mb-2">Contactgegevens</h3>
            {#if post.user.phone}
              <p>📞 {post.user.phone}</p>
            {/if}
            {#if post.user.email}
              <p>✉️ {post.user.email}</p>
            {/if}
            {#if post.user.website}
              <p>🌐 <a href={post.user.website} target="_blank" class="text-primary-blue hover:underline">{post.user.website}</a></p>
            {/if}
            {#if post.user.social_media}
              <p>📱 <a href={post.user.social_media} target="_blank" class="text-primary-blue hover:underline">{post.user.social_media}</a></p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Comments section -->
    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold text-primary-dark mb-4">Reacties ({comments.length})</h2>

      {#if currentUser}
        <form on:submit|preventDefault={handleSubmitComment} class="mb-6">
          <textarea
            bind:value={newComment}
            class="input-field w-full h-20"
            placeholder="Voeg een reactie toe..."
            required
          ></textarea>
          <button 
            type="submit" 
            class="btn-primary mt-2"
            disabled={submittingComment}
          >
            {submittingComment ? 'Plaatsen...' : 'Reageren'}
          </button>
        </form>
      {:else}
        <p class="text-gray-500 mb-4">
          <a href="/auth/login" class="text-primary-orange hover:underline">Log in</a> om te reageren.
        </p>
      {/if}

      <!-- Comments list -->
      {#if comments.length === 0}
        <p class="text-gray-500">Nog geen reacties.</p>
      {:else}
        <div class="space-y-4">
          {#each comments as comment}
            <div class="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div>
                {#if comment.user.profile_picture}
                  <img 
                    src={comment.user.profile_picture} 
                    alt="Profiel foto" 
                    class="w-10 h-10 rounded-full object-cover"
                  />
                {:else}
                  <div class="w-10 h-10 rounded-full bg-primary-orange flex items-center justify-center text-white font-bold">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                {/if}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-semibold text-primary-dark">{comment.user.name}</span>
                  <span class="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p class="text-gray-700">{comment.content}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
