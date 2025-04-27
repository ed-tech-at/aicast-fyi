<script lang="ts">
  import { onMount } from 'svelte';
  
  // import { renderEpisodeElementBackend } from '$lib/utils';
  import type { Episode, EpisodeElement } from '@prisma/client';

  export let data: { episode: Episode; episodeElements: EpisodeElement[] };
  // export let data: { episodeId: string; episode: Episode; episodeElements: EpisodeElement[]; date: string };

  // let title = data.episode.title || '';
  // let desc = data.episode.desc || '';

  // let audioPlaylist = []; // Store audio filenames
  // let currentAudioIndex = 0;
  // let audioPlayer;

  //   // Use an object to store audio in the correct order
  // let audioMap = {};
  let fragen = [];
  for (let i = 0; i < data.episodeElements.length; i++) {
    if (data.episodeElements[i].userQuestion?.length && !fragen.includes(data.episodeElements[i].userQuestion)) {
      fragen.push(data.episodeElements[i].userQuestion);
    }
  }
</script>

<h1>Track {data.episode.title}</h1>
<p>Track {data.episode.desc}</p>


{#each fragen as frage}
  <div>
    <label>{frage}</label>
   
    <input type="text" placeholder="Your answer here">
  </div>
{/each}
