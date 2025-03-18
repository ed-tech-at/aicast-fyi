<script lang="ts">
    import type { Audio } from 'openai/resources/index.mjs';
  import { onMount } from 'svelte';

  let voices = [];

  export let data: { audios: Audio[]; date: string };


  async function fetchVoices() {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        }
      });

      const result = await response.json();
      voices = result.voices || []; // Store voices list
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  }

  onMount(() => {
    fetchVoices();
  });



  async function generateAudio() {
    try {
      const response = await fetch('/admin/elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: "Wilkommen beim AI cast.",
          
          // voiceId: "pqHfZKP75CvOlQylNhV4" // Replace with actual voice ID
          voiceId: "NBqeXKdZHweef6y0B67V" // Replace with actual voice ID
        })
      });

      const result = await response.json();
      console.log(result);
      console.log("result");



      if (result.success) {
        // alert(`Audio generated successfully! Check /data/audio/${result.filename}`);
        console.log("Filename: " + result.filename);
        console.log("Cached: " + result.cached);
      } else {
        alert(`Error: ${result.error}`);
      }

    } catch (error) {
      console.error('Error generating audio:', error);
    }
  }


  function loadPlayer(sender, audioId) {
        const player = document.getElementById(`player-${audioId}`);
        if (player) {
          player.style.display = 'block';
        }
        sender.style.display = 'none';
      }

</script>


<h1>Admin </h1>

<a href="/admin/episode">Episodes</a>


{#each data.audios as audio}
  <div>
    <p>{audio.text}<br>
    <code>{audio.id}</code> - {audio.createdDate} 
    <br>
    <button on:click={(event) => loadPlayer(event.currentTarget, audio.id)}>Load Player</button>
    <audio id={`player-${audio.id}`} controls style="display: none;">
      <source src={`/api/audio/${audio.id}.mp3`} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
    </p>
   
  </div>
{/each}


<div>List of ElevenLabs voices</div>




<ul>
  {#each voices as voice}
    <li>
      <strong>{voice.name}</strong> 
      Voice ID: {voice.voice_id}
      {#if voice.labels && voice.labels.accent}
        - Nationality: {voice.labels.accent}
      {:else if voice.labels && voice.labels.language}
        - Language: {voice.labels.language}
      {/if}
    </li>
  {/each}
</ul>
<button on:click={generateAudio}>Generate MP3</button>
