<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';

  import type { Episodes } from '@prisma/client';

  export let data: { episodeId: string; episode: Episodes; date: string };

  let title = data.episode.title || '';
  let desc = data.episode.desc || '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const response = await fetch('/studio/' + data.episodeId + '?/update', {
      method: 'POST',
      body: formData
    });

    console.log(response);
    if (response.status === 200) {
      console.log(response);
      invalidate('/studio');
    }
  }
</script>

<main>
  <h1>Episode: {data.episodeId}</h1>

  {#if data.episode}
    <form on:submit={handleSubmit} action="?/update" method="post">
      <div>

        <label for="title">Title:</label>
        <input type="text" id="title" name="title" bind:value={title} placeholder="Untitled Episode" />

        <label for="desc">Description:</label>
        <textarea id="desc" name="desc" bind:value={desc} placeholder="No description available"></textarea>

        <label for="createdDate">Created Date: {new Date(data.episode.createdDate).toLocaleString()}</label>
        {#if data.episode.updatedDate}
          <label for="updatedDate">Updated Date: {new Date(data.episode.updatedDate).toLocaleString()}</label>
          {/if}
        <label for="email">Email:</label>
        <span id="email">{data.episode.email}</span>

        
      </div>
      <button type="submit">Update</button>
    </form>
  {:else}
    <p>No episode found.</p>
  {/if}
</main>