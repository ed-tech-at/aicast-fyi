<script lang="ts">
    import type { Track } from "@prisma/client";
  
  export let data: { tracks: Track[]; date: string };
</script>

<main>
  <h1>Admin Lookup for Track</h1>

  {#if data.tracks.length > 0}
    <ul>
      {#each data.tracks as track}
        <li>
          <h2>{track.title || 'Untitled Track'}</h2>
          <p>{track.desc || 'No description available'}</p>
            <p><strong>Created Date:</strong> {new Date(track.createdDate).toLocaleString()} <a href={`/studio/${track.id}`}>Edit</a></p>
        </li>
      {/each}
    </ul>
  {:else}
    <p>No tracks found.</p>
  {/if}
</main>