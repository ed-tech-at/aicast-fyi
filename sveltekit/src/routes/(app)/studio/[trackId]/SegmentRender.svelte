<script lang="ts">

  import { onMount } from 'svelte';
  import type { Segment, Voice } from '@prisma/client';
    import { audio } from 'elevenlabs/api/resources/voices/resources/pvc/resources/samples';


  export let segment : Segment; // Segment object passed from parent
  export let trackId; // Added trackId export
  export let segmentSubmit;
  export let voices: Voice[]; 

  let audioLoading = false;

  let audioTag: HTMLAudioElement;

  export let onAudioLoaded; // Callback to pass audio filenames up

  // console.log('Segment:', segment);

  
  function handleSegmentSubmit(event: Event) {
    segmentSubmit(event); // Call the passed function
    checkAudioCache(); // Check for audio cache after submitting
  }

  let audioSegment = null;
  
  async function loadVoiceVersion() {
    const voiceId = getVoiceIdByVoiceInt(voiceInt);
    console.log('loadVoiceVersion() voiceId:', voiceId);

    audioLoading = true;
    audioSegment = null;
    const response = await fetch('/studio/' + trackId , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "checkAudioVersion",
          form: JSON.stringify({ text: segment.text, voiceId: voiceId, voiceInt: voiceInt, segmentId: segment.id })
        })
      });

      const result = await response.json();
      if (result.success) {

        audioSegment = result.filename;
        setTimeout(() => {
          audioLoading = false;
          console.log('Audio2  loaded from cache:', audioSegment);
          if (audioTag) {
            audioTag.load();
          } else {
            console.error('Audio tag not found');
          }

        }, 200);
       
        
      } else {
        audioSegment = null;
        audioLoading = false;
        
      }
  }

  // let voiceId = voices[0]?.id; // Default to the first voice ID
  let voiceInt = voices[0]?.voiceInt; // Default to the first voice ID

  let voiceMap = new Map(voices.map(voice => [voice.voiceInt, voice.voice_id]));
  
  function getVoiceIdByVoiceInt(voiceInt) {
    return voiceMap.get(voiceInt);
  }

  // const voiceIdM = "NBqeXKdZHweef6y0B67V"; // Replace with actual voice ID
  // const voiceIdF = "Z3R5wn05IrDiVCyEkUrK"; // Replace with actual voice ID
  // const voiceIdF = "uvysWDLbKpA4XvpD3GI6"; // Replace with actual voice ID
  // const voiceIdF = "uvysWDLbKpA4XvpD3GI6"; // Replace with actual voice ID

  async function checkAudioCache() {

    console.log('checkAudioCache()');
    if (segment.text == "") {
      audioSegment = null;
      return;
    }

    // console.log('Checking audio cache for segment:', segment);
    // if (segment.audio != null) {
    //   audioSegment = segment.audio.folder + "/" + segment.audio.id + ".mp3";
    //   return;
    // }

    try {
      
      const voiceId = getVoiceIdByVoiceInt(voiceInt);

      console.log('voiceId:', voiceId);
      console.log('text:', segment.text);

      const response = await fetch('/studio/' + trackId , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "checkAudioGenerated",
          form: JSON.stringify({ text: segment.text, voiceId: voiceId, voiceInt, segmentId: segment.id })
        })
      });

      const result = await response.json();
      if (result.success) {
        audioSegment = result.filename;
        console.log('Audio loaded from cache:', audioSegment);
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
      const voiceId = getVoiceIdByVoiceInt(voiceInt);
      console.log('voiceId:', voiceId);
      console.log('voiceInt:', voiceInt);
      const response = await fetch('/studio/' + trackId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify({ text: segment.text, voiceId: voiceId, voiceInt, segmentId: segment.id }),
          action: 'generateAudio'
        })
      });

      const result = await response.json();
      if (result.success) {
        audioSegment = result.filename;
        console.log('Audio generated:', audioSegment);
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

      if (!segment.systemPrompt) {
        segment.text = 'Error: System prompt is required!';
        return;
      }
      if (!segment.defaultAnswer) {
        segment.text = 'Error: Default answer is required!';
        return;
      }
      if (!segment.studentQuestion) {
        segment.text = 'Error: Student question is required!';
        return;
      }

      const formData = {
        systemPrompt: segment.systemPrompt,
        studentQuestion: segment.studentQuestion,
        defaultAnswer: segment.defaultAnswer,
        segmentId: segment.id,
      };

      const response = await fetch('/studio/' + trackId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          form: JSON.stringify(formData), 
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

  async function loadStoredLLMResponse() {
    try {
      const formData = {
        systemPrompt: segment.systemPrompt,
        
        studentAnswer: segment.defaultAnswer,
        segmentId: segment.id,
      };
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formData,
          action: 'loadStoredLLMResponseForStudio'
        })
      });

      const result = await response.json();
      if (result.success) {
        segment.text = result.text.result;
      } else {
        segment.text = 'No old LLM response found.';
      }
    } catch (error) {
      // console.error('Error loading stored LLM response:', error);
      // audioSegment = 'Error loading stored LLM response: ' + error.message;
    }
  }


  onMount(() => {
    
    if (segment.type === 'ai') {
      loadStoredLLMResponse();
    }
    console.log('segment:', segment);
    // checkAudioCache();
    loadVoiceVersion();
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


  <label for="type">Type</label>

  <select name="type" bind:value={segment.type}>
    <option value="text">Text</option>
    <option value="ai">AI</option>
  </select>

  {#if segment.type === 'text'}
    <label>Text</label>
    <textarea bind:value={segment.text} name="text" class="text-input"></textarea>
    

    


    {:else if segment.type === 'ai'}
    

    <label>System Prompt</label>
    <textarea bind:value={segment.systemPrompt} name="systemPrompt" class="system-prompt jost"></textarea>
    <br>
    <label>Student Question</label>
    <textarea bind:value={segment.studentQuestion} name="studentQuestion" class="jost"></textarea>
    <br>

    <label>Test Student Answer (to test LLM response)</label>
    <textarea bind:value={segment.defaultAnswer} name="defaultAnswer" style="color: #329aa1;" class="jost"></textarea>
    <br>

    <button on:click={generateLLMResponseBtn} style="background-color: #329aa1;">Generate LLM Response</button>


    <label>Generated Response (for Audio)</label>
    <textarea bind:value={segment.text} name="text" class="text-input disabled" ></textarea>

    {/if}

  <br>


  <label for="type">Voice</label>

  <select name='voice' bind:value={voiceInt} on:change={() => loadVoiceVersion()}>
    {#each voices as voice}

      <option value={voice.voiceInt}>{voice.displayName}</option>
    {/each}

  </select>


  <button type="submit">Save</button>

  <div class="audioWrapper">

  {#if audioSegment}

    <!-- Audio: {audioSegment} -->
     <audio controls bind:this={audioTag}>
      <source src={`/api/audio/${audioSegment}`} type="audio/mp3">
      Your browser does not support the audio segment.
    </audio>
  {:else if audioLoading == true}
    <p>Loading audio...</p>
  {:else if audioSegment == null}
    <p>No audio available.</p>
    <button on:click={() => generateAudio()}>Generate Audio</button>
  {/if}
</div>


</form>


</div>