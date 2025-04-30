<script lang="ts">

  import { onMount } from 'svelte';
  import type { Segment } from '@prisma/client';

  export let segment : Segment; // Segment object passed from parent
  export let trackId; // Added trackId export
  export let segmentSubmit;

  let audioTag: HTMLAudioElement;

  export let onAudioLoaded; // Callback to pass audio filenames up

  // console.log('Segment:', segment);

  
  function handleSegmentSubmit(event: Event) {
    segmentSubmit(event); // Call the passed function
    checkAudioCache(); // Check for audio cache after submitting
  }

  let audioSegment = "";
  let userDemoInput = "";

  async function loadFemale() {
    const response = await fetch('/studio/' + trackId , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "checkAudioVersion",
          form: JSON.stringify({ text: segment.text, voiceId: voiceIdF, segmentId: segment.id })
        })
      });

      const result = await response.json();
      if (result.success) {
        audioSegment = result.filename;
        // onAudioLoaded(segment.position, audioSegment); // Pass filename to parent
        // filename = result.filename;
        audioTag.load();
      } else {
        audioSegment = null;
        
      }
  }

  let voiceId = "NBqeXKdZHweef6y0B67V";
  const voiceIdM = "NBqeXKdZHweef6y0B67V"; // Replace with actual voice ID
  // const voiceIdF = "Z3R5wn05IrDiVCyEkUrK"; // Replace with actual voice ID
  // const voiceIdF = "uvysWDLbKpA4XvpD3GI6"; // Replace with actual voice ID
  const voiceIdF = "ZQFCSsF1tIcjtMZJ6VCA"; // Replace with actual voice ID

  async function checkAudioCache() {

    // console.log('Checking audio cache for segment:', segment);
    if (segment.audio != null) {
      audioSegment = segment.audio.folder + "/" + segment.audio.id + ".mp3";
      return;
    }

    try {
      const response = await fetch('/studio/' + trackId , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "checkAudioGenerated",
          form: JSON.stringify({ text: segment.text, voiceId: voiceId, segmentId: segment.id })
        })
      });

      const result = await response.json();
      if (result.success) {
        audioSegment = result.filename;
        onAudioLoaded(segment.position, audioSegment); // Pass filename to parent
        // filename = result.filename;
      } else {
        audioSegment = null;
        
      }
    } catch (error) {
      console.error('Error checking audio cache:', error);
      audioSegment = 'Error checking audio cache: ' + error.message;
      audioSegment = null;
    }
  }

  async function generateAudio() {
    try {
      const response = await fetch('/studio/' + trackId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify({ text: segment.text, voiceId: voiceId, segmentId: segment.id }),
          action: 'generateAudio'
        })
      });

      const result = await response.json();
      if (result.success) {
        audioSegment = result.filename;
        onAudioLoaded(segment.position, audioSegment); // Pass filename to parent
      } else {
        audioSegment = 'Error generating audio: ' + result.error;
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      audioSegment = 'Error generating audio: ' + error.message;
    }
  }
  
  async function generateLLMResponseBtn() {
    try {
      segment.text = 'Generating LLM response...';
      const response = await fetch('/studio/' + trackId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify({ systemPrompt: segment.systemPrompt, userDemoInput: userDemoInput, segmentId: segment.id }), 
          action: 'generateLLMResponse'
        })
      });

      const result = await response.json();
      if (result.success) {
        segment.text = result.response;
      } else {
        segment.text = 'Error generating LLM response: ' + result.error;
      }
    } catch (error) {
      console.error('Error generating LLM response:', error);
      audioSegment = 'Error generating LLM response: ' + error.message;
    }
  }

  onMount(() => {
    checkAudioCache();
  });


</script>

<style>
  .segment {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
  }
</style>

<div class="segment2">
  
  <form on:submit={handleSegmentSubmit}>

    <input type="hidden" name="id" bind:value={segment.id} />


  {#if segment.type === 'text'}
    <label>Text:</label><br>
    <textarea bind:value={segment.text} name="text" class="text-input"></textarea>
    

    


    {:else if segment.type === 'ai'}

    <label>system Prompt</label>
    <textarea bind:value={segment.systemPrompt} name="systemPrompt" class="system-prompt"></textarea>
    <br>
    <label>User Question</label>
    <textarea bind:value={segment.studentQuestion} name="studentQuestion" ></textarea>
    <br>

    <label>User Demo Input</label>
    <textarea bind:value={userDemoInput} name="userDemoInput" style="color: #329aa1;"></textarea>
    <br>

    <button on:click={generateLLMResponseBtn} style="background-color: #329aa1;">Generate LLM Response</button>


    <label>Text:</label><br>
    <textarea bind:value={segment.text} name="text" class="text-input" ></textarea>

    {/if}

  <br>

  <label for="type">Type:</label>

  <select name="type" bind:value={segment.type}>
    <option value="text">Text</option>
    <option value="ai">AI</option>
  </select>

  <label for="type">Voice:</label>

  <select name="type" bind:value={voiceId}>
    <option value="{voiceIdM}" selected>Christian Plasa</option>
    <option value="{voiceIdF}">Leonie</option>
  </select>


  <button type="submit">Save</button>

  <div class="audioWrapper">

  {#if audioSegment}

  <span class="button" on:click={loadFemale} >Load Female</span>
    

    Audio: {audioSegment}
     <audio controls bind:this={audioTag}>
      <source src={`/api/audio/${audioSegment}`} type="audio/mp3">
      Your browser does not support the audio segment.
    </audio>
  {:else if audioSegment === null}
    <p>No audio available.</p>
    <button on:click={generateAudio}>Generate Audio</button>
  {/if}
</div>


</form>


</div>