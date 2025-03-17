<script lang="ts">
  export let element;
  export let episodeId; // Added episodeId export
  export let elementSubmit;

  import type { Audio } from '@prisma/client';

  import { PrismaClient } from '@prisma/client'; // Importing PrismaClient to query the database
  
  const prisma = new PrismaClient(); // Initialize Prisma Client

  function handleElementSubmit(event: Event) {
    elementSubmit(event); // Call the passed function
    checkAudioCache(); // Check for audio cache after submitting
  }

  let audioElement = "";
  let userDemoInput = "";


  const voiceId = "NBqeXKdZHweef6y0B67V"; // Replace with actual voice ID

  async function checkAudioCache() {
    try {
      const response = await fetch('/studio/' + episodeId , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "checkAudioGenerated",
          form: JSON.stringify({ text: element.text, voiceId: voiceId, elementId: element.id })
        })
      });

      const result = await response.json();
      if (result.success) {
        audioElement = result.filename;
        // filename = result.filename;
      } else {
        audioElement = null;
        
      }
    } catch (error) {
      console.error('Error checking audio cache:', error);
      audioElement = 'Error checking audio cache: ' + error.message;
    }
  }

  async function generateAudio() {
    try {
      const response = await fetch('/studio/' + episodeId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify({ text: element.text, voiceId: voiceId, elementId: element.id }),
          action: 'generateAudio'
        })
      });

      const result = await response.json();
      if (result.success) {
        audioElement = result.filename;
      } else {
        audioElement = 'Error generating audio: ' + result.error;
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      audioElement = 'Error generating audio: ' + error.message;
    }
  }
  
  async function generateLLMResponseBtn() {
    try {
      element.text = 'Generating LLM response...';
      const response = await fetch('/studio/' + episodeId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify({ developerPrompt: element.developerPrompt, userDemoInput: userDemoInput, elementId: element.id }), 
          action: 'generateLLMResponse'
        })
      });

      const result = await response.json();
      if (result.success) {
        element.text = result.response;
      } else {
        element.text = 'Error generating LLM response: ' + result.error;
      }
    } catch (error) {
      console.error('Error generating LLM response:', error);
      audioElement = 'Error generating LLM response: ' + error.message;
    }
  }

  checkAudioCache(); // Run when component loads


</script>

<style>
  .element {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
  }
</style>

<div class="element">
  Position: {element.position}
  <form on:submit={handleElementSubmit}>

    <input type="hidden" name="id" bind:value={element.id} />


  {#if element.type === 'text'}
    <label>Text:</label><br>
    <textarea bind:value={element.text} name="text"></textarea>
    

    


    {:else if element.type === 'ai'}

    <label>Developer Prompt</label>
    <textarea bind:value={element.developerPrompt} name="developerPrompt"></textarea>
    <br>
    <label>User Question</label>
    <textarea bind:value={element.userQuestion} name="userQuestion"></textarea>
    <br>

    <label>User Demo Input</label>
    <textarea bind:value={userDemoInput} name="userDemoInput"></textarea>
    <br>

    <button on:click={generateLLMResponseBtn}>Generate LLM Response</button>


    <label>Text:</label><br>
    <textarea bind:value={element.text} name="text"></textarea>

    {/if}

  <br>

  <label for="type">Type:</label>

  <select name="type" bind:value={element.type}>
    <option value="text">Text</option>
    <option value="ai">AI</option>
  </select>

  <button type="submit">Save</button>


  {#if audioElement}
    Audio: {audioElement}
     <audio controls>
      <source src={`/data/audio/${audioElement}`} type="audio/mp3">
      Your browser does not support the audio element.
    </audio>
  {:else if audioElement === null}
    <p>No audio available.</p>
    <button on:click={generateAudio}>Generate Audio</button>
  {/if}


</form>


</div>