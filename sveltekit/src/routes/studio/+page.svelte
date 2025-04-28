<script>

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let email = "";
  let lookupId = "";
  let createMessage = "";
  let lookupMessage = "";
  let lookupResult = null;
  let createdTracks = [];


  if (browser) {
    onMount(() => {
      const storedTracks = localStorage.getItem('createdTracks');
      createdTracks = storedTracks ? JSON.parse(storedTracks) : [];
    });
  }

  // Function to create a new track
  async function createTrack() {
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, action: 'create' })
      });

      const data = await res.json();
      if (data.success) {
          createMessage = `New track created with ID: ${data.track.id}`;

          createdTracks = [...createdTracks, data.track];
          localStorage.setItem('createdTracks', JSON.stringify(createdTracks));

      } else {
          createMessage = `Error: ${data.error}`;
      }
  }

  // Function to lookup an track by ID
  async function lookupTrack() {
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lookupId, action: 'lookup' })
      });

      const data = await res.json();
      if (data.success) {
          lookupResult = data.track;
          lookupMessage = "";

          createdTracks = [...createdTracks, data.track];
          localStorage.setItem('createdTracks', JSON.stringify(createdTracks));

      } else {
          lookupMessage = `Error: ${data.error}`;
          lookupResult = null;
      }
  }
</script>

<h1>Create New Track</h1>
<input type="email" bind:value={email} placeholder="Enter email" required />
<button on:click={createTrack}>Create Track</button>
<p>{createMessage}</p>

<h2>Created Tracks</h2>
<ul>
  {#each createdTracks as track}
    <li><a href={`/studio/${track.id}`}>{track.id}</a></li>
  {/each}
</ul>

<hr />

<h2>Lookup Track</h2>
<input type="text" bind:value={lookupId} placeholder="Enter Track ID" />
<button on:click={lookupTrack}>Lookup Track</button>
<p>{lookupMessage}</p>

{#if lookupResult}
  <div>
      <h3>Track Details</h3>
      <p><strong>ID:</strong> {lookupResult.id}</p>
      <p><strong>Titel:</strong> {lookupResult.title}</p>
      <p><strong>Email:</strong> {lookupResult.email}</p>
      <p><strong>Created Date:</strong> {new Date(lookupResult.createdDate).toLocaleString()}</p>
  </div>
{/if}
