<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { User, BusinessProfile } from '$lib/types';

  let user: User | null = null;
  let businessProfile: BusinessProfile | null = null;
  let loading = true;
  let editing = false;
  let name = '';
  let email = '';
  let phone = '';
  let website = '';
  let socialMedia = '';
  let profilePicture: File | null = null;
  let profilePictureUrl = '';

  // Business profile form
  let businessName = '';
  let businessDescription = '';
  let businessLogo: File | null = null;
  let businessCoverPhoto: File | null = null;
  let businessWebsite = '';
  let businessPhone = '';
  let businessSocialMedia = '';

  // Ads form
  let adTitle = '';
  let adDescription = '';
  let adMedia: File[] = [];
  let uploadingAd = false;

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
      name = userData.name;
      email = userData.email;
      phone = userData.phone || '';
      website = userData.website || '';
      socialMedia = userData.social_media || '';
      profilePictureUrl = userData.profile_picture || '';
    }

    // Fetch business profile if user is ondernemer
    if (userData?.role === 'ondernemer') {
      const { data: businessData } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .single();

      if (businessData) {
        businessProfile = businessData;
        businessName = businessData.business_name;
        businessDescription = businessData.description || '';
        businessWebsite = businessData.website || '';
        businessPhone = businessData.phone || '';
        businessSocialMedia = businessData.social_media || '';
      }
    }

    loading = false;
  });

  async function handleUpdateProfile() {
    if (!user) return;

    loading = true;

    // Upload profile picture if changed
    if (profilePicture) {
      const fileExt = profilePicture.name.split('.').pop();
      const fileName = `${user.id}_profile.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profiles')
        .upload(filePath, profilePicture);

      if (uploadError) {
        alert('Fout bij uploaden van profielfoto');
        loading = false;
        return;
      }

      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        profilePictureUrl = urlData.publicUrl;
      }
    }

    // Update user in database
    const { error } = await supabase
      .from('users')
      .update({
        name,
        phone,
        website,
        social_media: socialMedia,
        profile_picture: profilePictureUrl,
      })
      .eq('id', user.id);

    if (error) {
      alert('Fout bij bijwerken van profiel');
      loading = false;
      return;
    }

    // Update local user
    user = {
      ...user,
      name,
      phone,
      website,
      social_media: socialMedia,
      profile_picture: profilePictureUrl,
    };

    editing = false;
    loading = false;
    alert('Profiel succesvol bijgewerkt!');
  }

  async function handleCreateBusinessProfile() {
    if (!user || user.role !== 'ondernemer') return;

    loading = true;

    // Upload logo if provided
    let logoUrl = '';
    if (businessLogo) {
      const fileExt = businessLogo.name.split('.').pop();
      const fileName = `${user.id}_logo.${fileExt}`;
      const filePath = `business_logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business')
        .upload(filePath, businessLogo);

      if (uploadError) {
        alert('Fout bij uploaden van logo');
        loading = false;
        return;
      }

      const { data: urlData } = supabase.storage
        .from('business')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        logoUrl = urlData.publicUrl;
      }
    }

    // Upload cover photo if provided
    let coverPhotoUrl = '';
    if (businessCoverPhoto) {
      const fileExt = businessCoverPhoto.name.split('.').pop();
      const fileName = `${user.id}_cover.${fileExt}`;
      const filePath = `business_covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business')
        .upload(filePath, businessCoverPhoto);

      if (uploadError) {
        alert('Fout bij uploaden van cover foto');
        loading = false;
        return;
      }

      const { data: urlData } = supabase.storage
        .from('business')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        coverPhotoUrl = urlData.publicUrl;
      }
    }

    // Create or update business profile
    const { error } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: user.id,
        business_name: businessName,
        description: businessDescription,
        logo_url: logoUrl || businessProfile?.logo_url,
        cover_photo_url: coverPhotoUrl || businessProfile?.cover_photo_url,
        website: businessWebsite,
        phone: businessPhone,
        social_media: businessSocialMedia,
      });

    if (error) {
      alert('Fout bij aanmaken van bedrijfsprofiel');
      loading = false;
      return;
    }

    // Fetch updated business profile
    const { data: updatedProfile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (updatedProfile) {
      businessProfile = updatedProfile;
    }

    loading = false;
    alert('Bedrijfsprofiel succesvol bijgewerkt!');
  }

  async function handleCreateAd() {
    if (!businessProfile || !user) return;

    if (!adTitle || !adDescription) {
      alert('Vul alle verplichte velden in');
      return;
    }

    uploadingAd = true;

    // Upload media if any
    let mediaUrl = '';
    if (adMedia.length > 0) {
      const file = adMedia[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessProfile.id}_ad_${Date.now()}.${fileExt}`;
      const filePath = `business_ads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ads')
        .upload(filePath, file);

      if (uploadError) {
        alert('Fout bij uploaden van reclame media');
        uploadingAd = false;
        return;
      }

      const { data: urlData } = supabase.storage
        .from('ads')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        mediaUrl = urlData.publicUrl;
      }
    }

    // Create ad
    const { error } = await supabase
      .from('business_ads')
      .insert({
        business_profile_id: businessProfile.id,
        title: adTitle,
        description: adDescription,
        media_url: mediaUrl,
        is_active: true,
      });

    if (error) {
      alert('Fout bij aanmaken van reclame');
      uploadingAd = false;
      return;
    }

    // Reset form
    adTitle = '';
    adDescription = '';
    adMedia = [];
    uploadingAd = false;
    alert('Reclame succesvol toegevoegd!');
  }

  function handleProfilePictureUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      profilePicture = input.files[0];
    }
  }

  function handleBusinessLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      businessLogo = input.files[0];
    }
  }

  function handleBusinessCoverUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      businessCoverPhoto = input.files[0];
    }
  }

  function handleAdMediaUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      adMedia = Array.from(input.files).slice(0, 1); // Only one file for ads
    }
  }
</script>

<svelte:head>
  <title>Carcaide - Mijn Profiel</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  {#if loading}
    <p>Laden...</p>
  {:else if !user}
    <p>Gebruiker niet gevonden.</p>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Section -->
      <div class="lg:col-span-1">
        <div class="profile-section text-center">
          <div class="mb-4">
            {#if profilePictureUrl}
              <img 
                src={profilePictureUrl} 
                alt="Profiel foto" 
                class="w-32 h-32 rounded-full mx-auto object-cover"
              />
            {:else}
              <div class="w-32 h-32 rounded-full mx-auto bg-primary-orange flex items-center justify-center text-white text-4xl">
                {name.charAt(0).toUpperCase()}
              </div>
            {/if}
          </div>

          <h2 class="text-xl font-bold text-primary-dark">{name}</h2>
          <p class="text-gray-600">{email}</p>
          <p class="text-sm text-gray-500 capitalize">{user.role}</p>

          {#if !editing}
            <button on:click={() => editing = true} class="btn-primary mt-4">
              Profiel bewerken
            </button>
          {/if}

          <!-- Edit Profile Form -->
          {#if editing}
            <form on:submit|preventDefault={handleUpdateProfile} class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Naam</label>
                <input type="text" bind:value={name} class="input-field" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" bind:value={email} class="input-field" disabled />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                <input type="tel" bind:value={phone} class="input-field" placeholder="0612345678" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" bind:value={website} class="input-field" placeholder="https://..." />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Social Media</label>
                <input type="url" bind:value={socialMedia} class="input-field" placeholder="https://facebook.com/..." />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Profielfoto</label>
                <input type="file" on:change={handleProfilePictureUpload} accept="image/*" class="input-field" />
              </div>

              <div class="flex space-x-2">
                <button type="submit" class="btn-primary flex-1">Opslaan</button>
                <button type="button" on:click={() => editing = false} class="btn-secondary flex-1">Annuleren</button>
              </div>
            </form>
          {/if}

          <!-- Contact Info -->
          <div class="mt-6 text-left">
            <h3 class="font-semibold text-primary-dark mb-2">Contactgegevens</h3>
            {#if phone}
              <p class="text-sm">📞 {phone}</p>
            {/if}
            {#if website}
              <p class="text-sm">🌐 <a href={website} target="_blank" class="text-primary-blue hover:underline">{website}</a></p>
            {/if}
            {#if socialMedia}
              <p class="text-sm">📱 <a href={socialMedia} target="_blank" class="text-primary-blue hover:underline">{socialMedia}</a></p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Business Profile Section (for ondernemers) -->
      {#if user.role === 'ondernemer'}
        <div class="lg:col-span-2">
          <div class="profile-section">
            <h2 class="text-xl font-bold text-primary-dark mb-4">Bedrijfsprofiel</h2>

            {#if !businessProfile}
              <form on:submit|preventDefault={handleCreateBusinessProfile} class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam *</label>
                  <input type="text" bind:value={businessName} class="input-field" placeholder="Naam van je bedrijf" required />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
                  <textarea bind:value={businessDescription} class="input-field h-32" placeholder="Beschrijf je bedrijf..."></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                  <input type="file" on:change={handleBusinessLogoUpload} accept="image/*" class="input-field" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cover foto</label>
                  <input type="file" on:change={handleBusinessCoverUpload} accept="image/*" class="input-field" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer</label>
                  <input type="tel" bind:value={businessPhone} class="input-field" placeholder="0612345678" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" bind:value={businessWebsite} class="input-field" placeholder="https://..." />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Social Media</label>
                  <input type="url" bind:value={businessSocialMedia} class="input-field" placeholder="https://facebook.com/..." />
                </div>

                <button type="submit" class="btn-primary" disabled={loading}>
                  {loading ? 'Opslaan...' : 'Bedrijfsprofiel aanmaken'}
                </button>
              </form>
            {:else}
              <div>
                <!-- Display business profile -->
                <div class="mb-6">
                  {#if businessProfile.cover_photo_url}
                    <img 
                      src={businessProfile.cover_photo_url} 
                      alt="Cover foto" 
                      class="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  {/if}

                  <div class="flex items-center space-x-4 mb-4">
                    {#if businessProfile.logo_url}
                      <img 
                        src={businessProfile.logo_url} 
                        alt="Logo" 
                        class="w-20 h-20 rounded-lg object-cover"
                      />
                    {/if}
                    <div>
                      <h3 class="text-2xl font-bold text-primary-dark">{businessProfile.business_name}</h3>
                      <p class="text-gray-600">{businessProfile.description}</p>
                    </div>
                  </div>

                  <div class="space-y-2 text-sm">
                    {#if businessProfile.phone}
                      <p>📞 {businessProfile.phone}</p>
                    {/if}
                    {#if businessProfile.website}
                      <p>🌐 <a href={businessProfile.website} target="_blank" class="text-primary-blue hover:underline">{businessProfile.website}</a></p>
                    {/if}
                    {#if businessProfile.social_media}
                      <p>📱 <a href={businessProfile.social_media} target="_blank" class="text-primary-blue hover:underline">{businessProfile.social_media}</a></p>
                    {/if}
                  </div>

                  <button on:click={() => editing = true} class="btn-secondary mt-4">
                    Bedrijfsprofiel bewerken
                  </button>
                </div>

                <!-- Create Ad Form -->
                <div class="border-t pt-6">
                  <h3 class="text-lg font-semibold text-primary-dark mb-4">Reclame toevoegen</h3>
                  
                  <form on:submit|preventDefault={handleCreateAd} class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                      <input type="text" bind:value={adTitle} class="input-field" placeholder="Titel van je reclame" required />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Beschrijving *</label>
                      <textarea bind:value={adDescription} class="input-field h-24" placeholder="Beschrijf je reclame..." required></textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Media (foto of video)</label>
                      <input type="file" on:change={handleAdMediaUpload} accept="image/*, video/*" class="input-field" />
                      {#if adMedia.length > 0}
                        <p class="text-sm text-gray-500 mt-1">1 bestand geselecteerd</p>
                      {/if}
                    </div>

                    <button type="submit" class="btn-primary" disabled={uploadingAd}>
                      {uploadingAd ? 'Toevoegen...' : 'Reclame toevoegen'}
                    </button>
                  </form>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
