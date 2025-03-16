<script lang="ts">
  export let data: { emailLookup: string; episodes: Array<{ id: string; title?: string; desc?: string; createdDate: string }>; date: string };
</script>

<main>
  <h1>Lookup for: {data.emailLookup}</h1>

  {#if data.episodes.length > 0}
    <ul>
      {#each data.episodes as episode}
        <li>
          <h2>{episode.title || 'Untitled Episode'}</h2>
          <p>{episode.desc || 'No description available'}</p>
            <p><strong>Created Date:</strong> {new Date(episode.createdDate).toLocaleString()} <a href={`/studio/${episode.id}`}>Edit</a></p>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No episodes found.</p>
  {/if}
</main>