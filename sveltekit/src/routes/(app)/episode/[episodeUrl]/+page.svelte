<script lang="ts">
  import Footer from '$lib/Footer.svelte';
import { onMount } from 'svelte';
  


  export let data: { track: any; episodeUrl: string; abuseMail: string; episodeData: any[] };

  console.log('Episode data:', data);


  function startPlaylist() {
    if (audioPlaylist.length > 0) {
      currentAudioIndex = -1;
      playNextAudio();
    }
  }


  function handleAudioEnd() {
    playNextAudio();
  }

  function playAudioNumber(index) {
    currentAudioIndex = index - 1;
    playNextAudio();
  }

  function playNextAudio() {
    if (currentAudioIndex + 1 < audioPlaylist.length) {
      currentAudioIndex++;
      audioPlayer.src = `/api/audio/${audioPlaylist[currentAudioIndex]}`;
      audioPlayer.play();
      document.querySelector('.playing')?.classList.remove('playing');
      document.querySelector(`.number-${currentAudioIndex}`)?.classList.add('playing');
    }
  }

  let audioPlaylist = []; // Store audio filenames
  let currentAudioIndex = 0;
  let audioPlayer : HTMLAudioElement;

  onMount(() => {
    for (let i = 0; i < data.episodeData.length; i++) {
      audioPlaylist.push(data.episodeData[i].fileName);
    }
    audioPlayer.src = `/api/audio/${audioPlaylist[currentAudioIndex]}`;
    audioPlayer.load();
    
    console.log('Audio playlist:', audioPlaylist);
  });


</script>

<!-- <div class="bg-loop-circles"> -->
<main>
  <h1>Personalized aicast Episode</h1>
  <h2>Track: <b>{data.track.title}</b></h2>
  <p>{data.track.desc}</p>

  <p>Link to this episode: <a class="jetbrains-mono" href={`https://aicast.fyi/episode/${data.episodeUrl}`}>{`https://aicast.fyi/episode/${data.episodeUrl}`}</a></p>

  <div>
    <h2>Audio</h2>
    <button on:click={startPlaylist} class="play">&#9658; Play All</button>
    <audio bind:this={audioPlayer} on:ended={handleAudioEnd} controls></audio>
    
  </div>

  <!-- {#if data.episodeData.length} -->
    <div class="episode-data">
      {#each data.episodeData as episode, index}

        <p class="segments segment-{episode.type} number-{index}">{episode.text} <span class="button tiny btn-green" on:click={() => playAudioNumber(index)}>&#9658;</span></p>

      {/each}
      

  <!-- {/if} -->

  <div style="margin-top: 5rem;">
    <p><i>Want to create your own episode? <a href="/track/{data.track.email}/{data.track.URL}">Go to track page</a></i></p>
  </div>

</main>


<Footer abuseMail={data.abuseMail} abuseSubject="Abuse at aicast.fyi/episode/{data.episodeUrl}" />
<!-- </div> -->
