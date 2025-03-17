<script lang="ts">
    import type { Episode } from "@prisma/client";
  
  export let data: { episodes: Episode[]; date: string };
</script>

<main>
  <h1>Admin Lookup for Episode</h1>

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