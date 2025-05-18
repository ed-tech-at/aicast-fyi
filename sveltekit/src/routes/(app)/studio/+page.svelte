<script lang="ts">

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  import type { JwtUserPayload } from '$lib/server/jwt.ts';
    import type { ApiKey, Track } from '@prisma/client';
    import Footer from '$lib/Footer.svelte';
    

    let showApiImport = false;
    let showVoiceAdd = false;

    let newVoice = {
        displayName: "",
        voice_id: "",
        language_code: "en",
    };

    let selectedApiProvider = "";

  let newUrl = "";
  let lookupId = "";
  let createMessage = "";
  let newAPIKey = "";
  // let lookupMessage = "";
  // let lookupResult = null;
  // let createdTracks = [];

  async function addVoice(apiKeyId) {
      if (!newVoice.displayName || !newVoice.voice_id) {
          createMessage = "Please enter a voice name and ID.";
          return;
      }
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKeyId, newVoice, action: 'addVoice' })
      });
      const data = await res.json();
      if (data.success) {
          // Handle successful voice addition
          console.log(`Voice added successfully.`);
          window.location.reload();
      } else {
          console.error(`Error adding voice: ${data.error}`);
      }
  }

  async function removeVoice(apiKeyId, voiceInt, voiceId) {
      const newVoice = {
          voiceInt: voiceInt,
          voice_id: voiceId,
          apiKeyId: apiKeyId,
      };
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKeyId, newVoice, action: 'removeVoice' })
      });

      const data = await res.json();
      if (data.success) {
          // Handle successful deletion
          console.log(`Voice with ID ${voiceId} deleted successfully.`);
          window.location.reload();
      } else {
          console.error(`Error deleting voice: ${data.error}`);
      }
  }


  export let data: { user: JwtUserPayload, apiKeys: ApiKey[], createdTracks: Track[] };

  // if (browser) {
  //   onMount(() => {
  //     const storedTracks = localStorage.getItem('createdTracks');
  //     createdTracks = storedTracks ? JSON.parse(storedTracks) : [];
  //   });
  // }

  async function deleteApiKey(apiKeyId) {
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKeyId, action: 'deleteApiKey' })
      });

      const data = await res.json();
      if (data.success) {
          // Handle successful deletion
          console.log(`API key with ID ${apiKeyId} deleted successfully.`);
          window.location.reload();
      } else {
          console.error(`Error deleting API key: ${data.error}`);
      }
  }

  async function importApiKey() {
      if (!newAPIKey) {
          createMessage = "Please enter a API.";
          return;
      }

      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: newAPIKey, endpoint: selectedApiProvider, action: 'addApiKey' })
      });

      const data = await res.json();
      if (data.success) {
          // Handle successful import
          console.log(`API key imported successfully.`);
          window.location.reload();
      } else {
          console.error(`Error importing API key: ${data.error}`);
      }
  }

  // Function to create a new track
  async function createTrack() {

    if (!newUrl) {
        createMessage = "Please enter a URL.";
        return;

    }

      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newUrl, action: 'createTrack' })
      });

      const data = await res.json();
      if (data.success) {
          // createMessage = `New track created with ID: ${data.track.id}`;

          // createdTracks = [...createdTracks, data.track];
          // localStorage.setItem('createdTracks', JSON.stringify(createdTracks));

          window.location.href = `/studio/${data.track.id}`;


      } else {
          createMessage = `Error: ${data.error}`;
      }
  }

  // // Function to lookup an track by ID
  // async function lookupTrack() {
  //     const res = await fetch('/studio', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ lookupId, action: 'lookup' })
  //     });

  //     const data = await res.json();
  //     if (data.success) {
  //         lookupResult = data.track;
  //         lookupMessage = "";

  //         createdTracks = [...createdTracks, data.track];
  //         localStorage.setItem('createdTracks', JSON.stringify(createdTracks));

  //     } else {
  //         lookupMessage = `Error: ${data.error}`;
  //         lookupResult = null;
  //     }
  // }
</script>

<main>

<p>User: {data.user.email} (<a href="/logout" rel="external" >Logout</a>)</p>


<h1>aicast Studio</h1>
<h2>Create New Track</h2>
<input type="text" bind:value={newUrl} placeholder="Enter URL of new Track" class="jetbrains-mono" required />
<button on:click={createTrack}>Create Track</button>
<p>{createMessage}</p>

<h2>Created Tracks</h2>
<ul>
  {#each data.tracks as track}
    <li>{track.title} <a href={`/studio/${track.id}`}>/track/{data.user.email}/{track.URL}</a></li>
  {/each}
</ul>




API Keys: <span class="button small" on:click={() => showApiImport = !showApiImport}> Import API Keys +</span>
{#if showApiImport}
  <div>
    <h2>Import API Keys</h2>
    <p>Paste your API keys here:</p>
    <input type="text" bind:value={newAPIKey} placeholder="Enter API Key (sk....) or Shortcode" class="jetbrains-mono" required />


    <div>
      <label>
        <input type="radio" name="apiProvider" value="openai" bind:group={selectedApiProvider} />
        OpenAI
      </label>
      <label>
        <input type="radio" name="apiProvider" value="elevenlabs" bind:group={selectedApiProvider} />
        ElevenLabs
      </label>
      <label>
        <input type="radio" name="apiProvider" value="shortcode" bind:group={selectedApiProvider} />
        Shortcode
      </label>
    </div>

    <button on:click={importApiKey}>Import</button>
  </div>
{/if}




<ul>
  {#each data.apiKeys as key}
  <li>Endpoint: {key.endpoint} <span class="button tiny" on:click={() => deleteApiKey(key.id)}> Delete </span></li>
    
    <li>Key: {key.key}</li>
    {#if key.voices.length > 0}
      <ul>
        {#each key.voices as voice}
          <li>Voice {voice.displayName} (ID: {voice.voice_id} / {voice.language_code}) <span class="button tiny" on:click={() => removeVoice(key.id, voice.voiceInt, voice.voice_id)}>Remove</span></li>
        {/each}
      </ul>
      <span class='button tiny' on:click={() => showVoiceAdd = !showVoiceAdd}>Add Voice +</span>
      {#if showVoiceAdd}
        <div>
          <label for="voiceName">Voice Display Name</label>
          <input type="text" id="voiceName" bind:value={newVoice.displayName} />
          <label for="voiceId">ElevenLabs Voice ID</label>
          <input type="text" id="voiceId" bind:value={newVoice.voice_id}  class="jetbrains-mono"  />
          <label for="voiceLanguage">Voice Language</label>
          <input type="text" id="voiceLanguage" bind:value={newVoice.language_code} />
          <button on:click={() => addVoice(key.id)}>Add Voice</button>
        </div>
      {/if}

    {/if}
    <br>
  {/each}
</ul>


</main>

<Footer />