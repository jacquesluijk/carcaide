<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_approved')
        .eq('id', user.id)
        .single();
      
      if (userData?.is_approved) {
        await goto('/');
      }
    }
  });

  async function handleLogin() {
    if (!email || !password) {
      error = 'Vul alle velden in';
      return;
    }

    loading = true;
    error = '';

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      error = authError.message;
      loading = false;
      return;
    }

    // Check if user is approved
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('is_approved, role')
        .eq('id', user.id)
        .single();

      if (userData?.is_approved) {
        await goto('/');
      } else {
        error = 'Je account wacht nog op goedkeuring door de administrator.';
      }
    }

    loading = false;
  }
</script>

<svelte:head>
  <title>Carcaide - Inloggen</title>
</svelte:head>

<div class="max-w-md mx-auto">
  <h1 class="text-3xl font-bold text-primary-dark mb-8 text-center">Inloggen</h1>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleLogin} class="space-y-6">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="input-field"
        placeholder="je@email.com"
        required
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        class="input-field"
        placeholder="••••••••"
        required
      />
    </div>

    <button 
      type="submit" 
      class="btn-primary w-full"
      disabled={loading}
    >
      {loading ? 'Inloggen...' : 'Inloggen'}
    </button>
  </form>

  <p class="text-center mt-4 text-gray-600">
    Nog geen account? <a href="/auth/register" class="text-primary-orange hover:underline">Registreer hier</a>
  </p>
</div>
