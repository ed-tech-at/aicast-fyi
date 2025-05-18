<script lang="ts">
  import SegmentRender from './SegmentRender.svelte';
import type { Voice, ApiKey, Episode } from '@prisma/client';
import type { JwtUserPayload } from '$lib/server/jwt.ts';

import Footer from '$lib/Footer.svelte';

  
  import type { Track, Segment } from '@prisma/client';

  export let data: { user: JwtUserPayload; trackId: string; track: Track; segments: Segment[]; apiKeys: ApiKey[]; voices: Voice[], episodes: Episode[] };

  let title = data.track.title || '';
  let desc = data.track.desc || '';

  let showDelForm = false;

  console.log('voices:', data.voices);

  let audioPlaylist = []; // Store audio filenames
  let currentAudioIndex = 0;
  let audioPlayer : HTMLAudioElement;

    // Use an object to store audio in the correct order
  let audioMap = {};

    // When audio is loaded, store it in the correct order
  function onAudioLoaded(position, filename) {
    // console.log('Audio loaded:', position, filename);
    audioMap[position] = filename;
    // console.log('Audio audioMap:', audioMap);

    // Once all segments are processed, rebuild the ordered playlist
    audioPlaylist = Object.entries(audioMap)
      .sort(([a], [b]) => Number(a) - Number(b)) // Sort by numeric position
      .map(([_, filename]) => filename); // Extract filenames

    // console.log('Audio playlist:', audioPlaylist);
  }


  function playNextAudio() {
    if (currentAudioIndex < audioPlaylist.length) {
      audioPlayer.src = `/api/audio/${audioPlaylist[currentAudioIndex]}`;
      audioPlayer.play();
      currentAudioIndex++;
    }
  }

  function startPlaylist() {
    if (audioPlaylist.length > 0) {
      currentAudioIndex = 0;
      playNextAudio();
    }
  }

  function handleAudioEnd() {
    playNextAudio();
  }



  async function updateTrack(event: Event) {
    event.preventDefault();

    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form: data.track,
        action: 'updateTrack'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      
      // console.log('Track updated successfully:', result);

      data.track = result.track;

    } else {
      console.error('Error updating track:', result.error);
    }
  }
  
  
  async function segmentSubmit(event: Event) {
    
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Extract the segment ID and text
    const segmentId = formData.get("id") as string;
    const text = formData.get("text") as string;
    const studentQuestion = formData.get("studentQuestion") as string; // Change this line to correctly get the user input
    const type = formData.get("type") as string; // Change this line to correctly get the user input
    const systemPrompt = formData.get("systemPrompt") as string; // Change this line to correctly get the user input
    const defaultAnswer = formData.get("defaultAnswer") as string; // Change this line to correctly get the user input


    // console.log("Form Data:", formData);

    // console.log("Segment ID:", segmentId);
    // console.log("Text:", text);
    // console.log("User Question:", userQuestion); // Log userQuestion for debugging
    // console.log("Type:", type); // Log type for debugging
    

    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form: JSON.stringify({ text, studentQuestion, systemPrompt, defaultAnswer, type, segmentId }),
        action: 'updateSegment'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      
      // console.log('Segment updated successfully:', result);

      data.segments = result.segments; // Update track segments

    } else {
      console.error('Error updating segment:', result.error); // Update error message
    }
  }

  async function createSegment(event: Event) {
    event.preventDefault();

    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'createSegment',
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      data.segments = result.segments;

    } else {
      console.error('Error creating segment:', result.error);
    }
  }


  // console.log('data:', data);

  async function moveSegmentDown(segmentId: string) {
    // Logic for moving the segment down will be implemented here.
    // console.log('Moving segment down:', segmentId);
  
    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'moveDown',
        segmentId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      data.segments = result.segments;
      // console.log('Segments updated successfully:', result);
    } else {
      console.error('Error moving segment down:', result.error);
    }
  }


  async function deleteSegment(segmentId: string) {
    
    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteSegment',
        segmentId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      data.segments = result.segments;
      // console.log('Segments updated successfully:', result);
    } else {
      console.error('Error moving segment down:', result.error);
    }
  }


  async function moveSegmentUp(segmentId: string) {
    // Logic for moving the segment up will be implemented here.
    // console.log('Moving segment up:', segmentId);
  
    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'moveUp',
        segmentId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      data.segments = result.segments;
      // console.log('Segments updated successfully:', result);
    } else {
      console.error('Error moving segment down:', result.error);
    }
  }

  async function deleteTrack(event: Event) {
    event.preventDefault();

    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'deleteTrack',
        trackId: data.trackId,
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      // Redirect to the studio overview page
      window.location.href = '/studio';
    } else {
      console.error('Error deleting track:', result.error);
    }
  }

</script>

<main>

<div>
  <p><a href="/studio">Back to aicast Studio Overview</a></p>
  <h1>Track: {data.track.title}</h1>
  <!-- <p>Track ID: <code>{data.track.id}</code></p> -->

  {#if data.track}
    <form on:submit={updateTrack}>
      <div>

        <label for="title">Track Title</label>
        <input type="text" id="title" name="title" bind:value={data.track.title} placeholder="Untitled Track" />

        <label for="desc">Description</label>
        <textarea id="desc" class="jost" name="desc" bind:value={data.track.desc} placeholder="No description available"></textarea>

        <label for="url">URL <a href='https://aicast.fyi/track/{data.user.email}/{data.track.URL}' class="jetbrains-mono" target="_blank" rel="external">https://aicast.fyi/track/{data.user.email}/<b>{data.track.URL}</b></a></label>
        <input id="url" name="url" bind:value={data.track.URL} placeholder="No URL available" />

        <label for="llmApiKey">API LLM</label>
        <select id="llmApiKey" bind:value={data.track.apiKeyLLMId}>
          <option value="" disabled selected>Select an API Key</option>
          {#each data.apiKeys.filter(key => key.endpoint === 'openai') as key}
            <option value={key.id} selected={key.id === data.track.apiKeyLLMId}>{key.key}</option>
          {/each}
        </select>
        
        <label for="audioApiKey">API ElevenLabs</label>
        <select id="audioApiKey" bind:value={data.track.apiKeyAudioId}>
          <option value="" disabled selected>Select an API Key</option>
          {#each data.apiKeys.filter(key => key.endpoint === 'elevenlabs') as key}
            <option value={key.id} selected={key.id === data.track.apiKeyAudioId}>{key.key}</option>
          {/each}
        </select>



        <label for="accessCode">Access Codes:</label>
        <textarea id="accessCode" name="accessCode" bind:value={data.track.accessCode} placeholder="No access code set"></textarea>

        <label for="createdDate">Created Date: {new Date(data.track.createdDate).toLocaleString()}</label>
        {#if data.track.updatedDate}
          <label for="updatedDate">Updated Date: {new Date(data.track.updatedDate).toLocaleString()}</label>
        {/if}
        
        
      </div>

      <button type="submit">Update</button>
    </form>

    <hr />


  <div class="audio-playlist">
    <h3>Audio Playlist</h3>
    <button on:click={startPlaylist} class="play">Play All</button>
    <audio bind:this={audioPlayer} on:ended={handleAudioEnd} controls></audio>

    <!-- 

    {#each audioPlaylist as audioFile}

      <div>{audioFile}</div>
    {/each} -->
  
  </div>


  <hr />
    <h2>Segments</h2>

    <!-- <ul> -->
      {#each data.segments as segment}
        <!-- <li> -->
          <!-- {segment.createdDate} {segment.type} {segment.position} -->

          <div class="segment">
            <!-- Position:  -->
            <!-- {segment.position} {segment.id} -->
            
            <SegmentRender segment={segment} trackId={data.trackId} segmentSubmit={segmentSubmit}  onAudioLoaded={onAudioLoaded} voices={data.voices} />

            <div class="move-buttons">
              <button on:click={() => moveSegmentUp(segment.id)}>Move Up</button>
              <button on:click={() => moveSegmentDown(segment.id)}>Move Down</button>
              <button on:click={() => deleteSegment(segment.id)}>Delete Segment</button>
            </div>

          </div>

        <!-- </li> -->
      {/each}
    <!-- </ul> -->


    <button on:click={createSegment}>Add Segment</button>


  {:else}
    <p>No track found.</p>
  {/if}

  
  <hr style="margin: 3em;">
  <h2>Generated Episodes</h2>


    {#if data.episodes.length === 0}
      
        <p>No episodes generated.</p>
      
    {:else}
      
        <p>Total Episodes: {data.episodes.length}</p>

        
      
    

  <table>

    <thead>
      <tr>
        <th>Episode ID</th>
        <th>Created Date</th>
        <th>Access Code</th>
        <th>Answers</th>
      </tr>
    </thead>
    <tbody>

  {#each data.episodes as episode, index}
    <tr>
      <td><a href="/episode/{episode.id}" target="_blank" rel="external">{episode.id}</a></td>
      <td>{new Date(episode.createdDate).toLocaleString()}</td>
      <td>{episode.studentName}</td>
      <td>
        {#each Object.entries(JSON.parse(episode.answers)) as [question, answer]}
          <p><i style="opacity: 0.5;">{question}</i> {answer}</p>
        {/each}
      </td>
    </tr>
  {/each}
  </tbody>
  </table>


    {/if}

    <hr style="margin: 3em;">
    <h2>Delete Track and Episodes</h2>

    <button class="button small danger" on:click={() => showDelForm = !showDelForm}>Delete Track and Episodes {showDelForm ? '—' : '+'}</button>

    {#if showDelForm}
      <form on:submit|preventDefault={deleteTrack} class="delete-track-form">
        <p>Are you sure you want to delete this track and all associated episodes?</p>
        <button type="submit" class="button small danger">Delete Track</button>
      </form>
    {/if}
    

</div>


</main>

<Footer />