<script lang="ts">
  import { onMount } from 'svelte';
  
  // import { renderSegmentBackend } from '$lib/utils';
  import type { Track, Segment } from '@prisma/client';

  export let data: { track: Track; segments: Segment[] };
  // export let data: { trackId: string; track: Track; segments: Segment[]; date: string };

  // let title = data.track.title || '';
  // let desc = data.track.desc || '';

  // let audioPlaylist = []; // Store audio filenames
  // let currentAudioIndex = 0;
  // let audioPlayer;

  //   // Use an object to store audio in the correct order
  // let audioMap = {};
  let fragen = [];
  for (let i = 0; i < data.segments.length; i++) {
    if (data.segments[i].userQuestion?.length && !fragen.includes(data.segments[i].userQuestion)) {
      fragen.push(data.segments[i].userQuestion);
    }
  }
</script>

<h1>Track {data.track.title}</h1>
<p>Track {data.track.desc}</p>


{#each fragen as frage}
  <div>
    <label>{frage}</label>
   
    <input type="text" placeholder="Your answer here">
  </div>
{/each}
