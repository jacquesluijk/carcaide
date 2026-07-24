<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import type { UserRole } from '$lib/types';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let role: UserRole = 'particulier';
  let phone = '';
  let error = '';
  let success = false;
  let loading = false;

  const roles: { value: UserRole; label: string }[] = [
    { value: 'particulier', label: 'Particulier' },
    { value: 'ondernemer', label: 'Ondernemer' },
    { value: 'werkzoekende', label: 'Werkzoekende' },
  ];

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      error = 'Vul alle verplichte velden in';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Wachtwoorden komen niet overeen';
      return;
    }

    if (password.length < 6) {
      error = 'Wachtwoord moet minimaal 6 tekens lang zijn';
      return;
    }

    loading = true;
    error = '';

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          phone,
          is_approved: false, // Users need admin approval
        },
      },
    });

    if (authError) {
      error = authError.message;
      loading = false;
      return;
    }

    // Insert user into users table
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email,
        name,
        role,
        phone,
        is_approved: false,
      });

    if (dbError) {
      error = dbError.message;
      loading = false;
      return;
    }

    success = true;
    loading = false;

    // Clear form
    name = '';
    email = '';
    password = '';
    confirmPassword = '';
    phone = '';
  }
</script>

<svelte:head>
  <title>Carcaide - Registreren</title>
</svelte:head>

<div class="max-w-md mx-auto">
  <h1 class="text-3xl font-bold text-primary-dark mb-8 text-center">Registreren</h1>

  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
      Registratie succesvol! Je account wacht nu op goedkeuring door de administrator.
      Je ontvangt een email als je account is goedgekeurd.
    </div>
  {/if}

  <form on:submit|preventDefault={handleRegister} class="space-y-6">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
      <input
        type="text"
        id="name"
        bind:value={name}
        class="input-field"
        placeholder="Je naam"
        required
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
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
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Wachtwoord *</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        class="input-field"
        placeholder="••••••••"
        required
      />
    </div>

    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Bevestig wachtwoord *</label>
      <input
        type="password"
        id="confirmPassword"
        bind:value={confirmPassword}
        class="input-field"
        placeholder="••••••••"
        required
      />
    </div>

    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
      <select id="role" bind:value={role} class="input-field">
        {#each roles as r}
          <option value={r.value}>{r.label}</option>
        {/each}
      </select>
    </div>

    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
      <input
        type="tel"
        id="phone"
        bind:value={phone}
        class="input-field"
        placeholder="0612345678"
      />
    </div>

    <button 
      type="submit" 
      class="btn-primary w-full"
      disabled={loading}
    >
      {loading ? 'Registreren...' : 'Registreren'}
    </button>
  </form>

  <p class="text-center mt-4 text-gray-600">
    Heb je al een account? <a href="/auth/login" class="text-primary-orange hover:underline">Log hier in</a>
  </p>
</div>
