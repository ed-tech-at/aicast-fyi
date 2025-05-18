
<script lang="ts">
  import { onMount } from 'svelte';
  import type { Track, Segment, Voice } from '@prisma/client';
  
  import Footer from '$lib/Footer.svelte';
  
  

  export let data: { track: Track; accessCodeRequired: boolean; trackUrl: string; email: string, voices: Voice[] };

  let voiceInt = data.voices[0]?.voiceInt;

  let audioTag: HTMLAudioElement;


  let accessCodeInput = '';
  let segments: Segment[] = [];
  let fragen: string[] = [];
  let answers: Record<string, string> = {}; // Object to store answers keyed by the question

  console.log('data:', data.voices);

  let submitButtonReplaceText = "";

  let accessCodeButtonText = 'Submit Access Code';

  let voiceFileName = "";

  function escapeHtml(str) {
    if (typeof str !== 'string') {
      return str;
    }
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDesc(str) {
    if (typeof str !== 'string') {
      return str;
    }
    const escaped = escapeHtml(str);

    // Convert **bold** to <strong>bold</strong>
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert newlines to <br>
    return withBold.replace(/\n/g, '<br>');
  }

  const formattedDesc = formatDesc(data.track.desc);

  async function updateVoice() {
    const selectedVoice = data.voices.find((voice) => voice.voiceInt == voiceInt);
    
    try {
      const response = await fetch('/api/episode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData: {
          voiceInt: selectedVoice?.voiceInt,
          voiceId: selectedVoice?.voice_id,
          trackId: data.track.id,
        },
        action: 'getEpisodeVoiceDemo',
      }),
      });

      if (!response.ok) {
      throw new Error(`Failed to fetch voice demo: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        voiceFileName = result.filename;

        setTimeout(() => {
          audioTag.load();
        }, 100);

      } else {
      console.error('Error fetching voice demo:', result.error);
      }
    } catch (error) {
      console.error('Error in updateVoice:', error);
    }



  }

  onMount(() => {
    // Fetch segments when the component mounts
    getSegments();
    
  });

  async function getSegments() {
    try {
      if (data.accessCodeRequired && !accessCodeInput) {
        return;
      }

      const response = await fetch(`/track/${data.email}/${data.trackUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            id: data.track.id,
            accessCode: accessCodeInput,
          },
          action: 'access',
        }),
      });


      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch segments');
      }



      const result = await response.json();


      console.log('result status:', result.status);
      if (result.status === 403) {
        accessCodeButtonText = result.error || 'access denied';
        return;
      }

      segments = result.segments;

      data.accessCodeRequired = false; // Hide access code input after successful fetch

      updateVoice();

      // Extract unique questions from segments
      fragen = segments
        .filter((segment) => segment.studentQuestion?.length)
        .map((segment) => segment.studentQuestion)
        .filter((frage, index, self) => self.indexOf(frage) === index); // Ensure uniqueness
    } catch (error) {
      console.error('Error fetching segments:', error);
    }
  }

  function handleInputChange(frage: string, event: Event) {
    const target = event.target as HTMLInputElement;
    answers[frage] = target.value; // Update the answer for the corresponding question
  }

  async function createEpisode() {
    console.log('Creating episode with questions and answers:', answers);

    submitButtonReplaceText = "Thank you for your submission! The episode is being generated...";
    try {

      const selectedVoice = data.voices.find((voice) => voice.voiceInt == voiceInt);

      const response = await fetch('/api/episode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            fragen: answers,
            trackId: data.track.id,
            accessCode: accessCodeInput,
            voiceInt: voiceInt,
            voiceId: selectedVoice?.voice_id,
          },
          action: 'createEpisode',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create episode: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success == true) {
        submitButtonReplaceText = "Episode created successfully! Go to <a class='button' href='/episode/" + result.episode.id + "'>your episode</a>";
      } else {
        submitButtonReplaceText = result.error || 'Failed to create episode';
      }

      console.log('Episode created successfully:', result);
    } catch (error) {
      console.error('Error creating episode:', error);
    }
  }
</script>
<!-- <div class="bg-loop-circles"> -->

<main class="">
  <h1>Track: {data.track.title}</h1>
  <p>{@html formattedDesc}</p>

  {#if data.accessCodeRequired}
    <form on:submit|preventDefault={getSegments}>
      <label for="accessCode">Access Code</label>
      <input
        type="text"
        id="accessCode"
        required
        bind:value={accessCodeInput}
        placeholder="enter access code"
      />
      <button type="submit">{accessCodeButtonText}</button>
    </form>
  {/if}

  {#if fragen.length}

    <h2>Voice</h2>
    <div>
      <label for="voice">Select Voice</label>
      <select id="voice" bind:value={voiceInt} on:change={() => updateVoice()}>
        {#each data.voices as voice}
          <option value={voice.voiceInt}>{voice.displayName}</option>
        {/each}
      </select>

      <p>Listen to Voice</p>
      {#if voiceFileName}
        <audio controls  bind:this={audioTag}>
          <source src={`/api/audio/${voiceFileName}`} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      {/if}

    </div>

    <h2>Questions to generate your Episode</h2>

    <form on:submit|preventDefault={createEpisode}>
    {#each fragen as frage}
      <div class="frage">
        <label>{frage}</label>
        <input
          type="text"
          placeholder="Your answer here" required
          on:change={(event) => handleInputChange(frage, event)}
        />
      </div>
    {/each}


    {#if submitButtonReplaceText}
      <div>{@html submitButtonReplaceText}</div>
    {:else}
    <div>
      <button type="submit">Submit and create Episode</button>
    </div>

    {/if}

    </form>
  {:else}
    <p>No questions available to generate episode. Please add an AI segment to the track.</p>
  {/if}
</main>

<Footer abuseMail={data.email} abuseSubject="Abuse at aicast.fyi/track/{data.email}/{data.trackUrl}" />

