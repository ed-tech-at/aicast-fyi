<script>

  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let email = "";
  let lookupId = "";
  let createMessage = "";
  let lookupMessage = "";
  let lookupResult = null;
  let createdEpisodes = [];


  if (browser) {
    onMount(() => {
      const storedEpisodes = localStorage.getItem('createdEpisodes');
      createdEpisodes = storedEpisodes ? JSON.parse(storedEpisodes) : [];
    });
  }

  // Function to create a new episode
  async function createEpisode() {
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, action: 'create' })
      });

      const data = await res.json();
      if (data.success) {
          createMessage = `New episode created with ID: ${data.episode.id}`;

          createdEpisodes = [...createdEpisodes, data.episode];
          localStorage.setItem('createdEpisodes', JSON.stringify(createdEpisodes));

      } else {
          createMessage = `Error: ${data.error}`;
      }
  }

  // Function to lookup an episode by ID
  async function lookupEpisode() {
      const res = await fetch('/studio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lookupId, action: 'lookup' })
      });

      const data = await res.json();
      if (data.success) {
          lookupResult = data.episode;
          lookupMessage = "";

          createdEpisodes = [...createdEpisodes, data.episode];
          localStorage.setItem('createdEpisodes', JSON.stringify(createdEpisodes));

      } else {
          lookupMessage = `Error: ${data.error}`;
          lookupResult = null;
      }
  }
</script>

<h1>Create New Episode</h1>
<input type="email" bind:value={email} placeholder="Enter email" required />
<button on:click={createEpisode}>Create Episode</button>
<p>{createMessage}</p>

<h2>Created Episodes</h2>
<ul>
  {#each createdEpisodes as episode}
    <li><a href={`/studio/${episode.id}`}>{episode.id}</a></li>
  {/each}
</ul>

<hr />

<h2>Lookup Episode</h2>
<input type="text" bind:value={lookupId} placeholder="Enter Episode ID" />
<button on:click={lookupEpisode}>Lookup Episode</button>
<p>{lookupMessage}</p>

{#if lookupResult}
  <div>
      <h3>Episode Details</h3>
      <p><strong>ID:</strong> {lookupResult.id}</p>
      <p><strong>Titel:</strong> {lookupResult.title}</p>
      <p><strong>Email:</strong> {lookupResult.email}</p>
      <p><strong>Created Date:</strong> {new Date(lookupResult.createdDate).toLocaleString()}</p>
  </div>
{/if}
