<script lang="ts">
  import '../app.css';
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { User } from '$lib/types';

  let user: User | null = null;
  let loading = true;

  onMount(async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    
    if (supabaseUser) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (data) {
        user = data;
      }
    }
    
    loading = false;
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    user = null;
    await goto('/');
  }

  $: if (!loading && !user && !['/auth/login', '/auth/register'].includes($page.url.pathname)) {
    goto('/auth/login');
  }
</script>

<svelte:head>
  <title>Carcaide - Marktplaats voor Carcassonne</title>
</svelte:head>

<div class="min-h-screen bg-primary-light">
  <nav class="navbar flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <a href="/" class="text-2xl font-bold text-primary-orange">Carcaide</a>
    </div>
    
    <div class="flex items-center space-x-4">
      {#if user}
        <a href="/profile" class="text-primary-blue hover:text-blue-600">Profiel</a>
        {#if user.role === 'admin'}
          <a href="/admin" class="text-primary-orange hover:text-orange-600">Admin</a>
        {/if}
        <button on:click={handleLogout} class="btn-secondary">Uitloggen</button>
      {:else}
        <a href="/auth/login" class="text-primary-blue hover:text-blue-600">Inloggen</a>
        <a href="/auth/register" class="btn-primary">Registreren</a>
      {/if}
    </div>
  </nav>

  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>

  <footer class="bg-white py-4 mt-8 border-t">
    <div class="container mx-auto px-4 text-center text-gray-600">
      <p>© {new Date().getFullYear()} Carcaide. Alle rechten voorbehouden.</p>
    </div>
  </footer>
</div>
