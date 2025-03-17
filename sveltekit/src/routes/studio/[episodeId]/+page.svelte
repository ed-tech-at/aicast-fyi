<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';

  
  import type { Episode, EpisodeElement } from '@prisma/client';

  export let data: { episodeId: string; episode: Episode; episodeElements: EpisodeElement[]; date: string };

  let title = data.episode.title || '';
  let desc = data.episode.desc || '';

  async function handleSubmit(event: Event) {
    event.preventDefault();

    const response = await fetch(`/studio/${data.episodeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        desc,
        action: 'update'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      
      console.log('Episode updated successfully:', result);

      data.episode = result.episode;

    } else {
      console.error('Error updating episode:', result.error);
    }
  }

  async function createElement(event: Event) {
    event.preventDefault();

    const response = await fetch(`/studio/${data.episodeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createElement',
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      data.episodeElements = result.episodeElements;

      console.log('Element created successfully:', result.episodeElements);
    } else {
      console.error('Error creating element:', result.error);
    }
  }


  console.log('data:', data);

  async function moveElementDown(elementId: string) {
    // Logic for moving the element down will be implemented here.
    console.log('Moving element down:', elementId);
  
    const response = await fetch(`/studio/${data.episodeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'moveDown',
        elementId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      data.episodeElements = result.elements;
      console.log('Elements updated successfully:', result);
    } else {
      console.error('Error moving element down:', result.error);
    }
  }


  async function moveElementUp(elementId: string) {
    // Logic for moving the element up will be implemented here.
    console.log('Moving element up:', elementId);
  
    const response = await fetch(`/studio/${data.episodeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'moveUp',
        elementId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      data.episodeElements = result.elements;
      console.log('Elements updated successfully:', result);
    } else {
      console.error('Error moving element down:', result.error);
    }
  }

</script>

<main>
  <h1>Episode: {data.episodeId}</h1>

  {#if data.episode}
    <form on:submit={handleSubmit}>
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

    <hr />
    <h2>Elements</h2>

    <ul>
      {#each data.episodeElements as episodeElement}
        <li>
          {episodeElement.createdDate} {episodeElement.type} {episodeElement.position}
          <button on:click={() => moveElementUp(episodeElement.id)}>Move Up</button>
          <button on:click={() => moveElementDown(episodeElement.id)}>Move Down</button>
        </li>
      {/each}
    </ul>


    <button on:click={createElement}>Create Element</button>


  {:else}
    <p>No episode found.</p>
  {/if}
</main>
