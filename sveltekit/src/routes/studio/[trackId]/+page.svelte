<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  // import { renderSegmentBackend } from '$lib/utils';
  import SegmentRender from './SegmentRender.svelte';
  
  import type { Track, Segment } from '@prisma/client';

  export let data: { trackId: string; track: Track; segments: Segment[]; date: string };

  let title = data.track.title || '';
  let desc = data.track.desc || '';

  let audioPlaylist = []; // Store audio filenames
  let currentAudioIndex = 0;
  let audioPlayer;

    // Use an object to store audio in the correct order
  let audioMap = {};

    // When audio is loaded, store it in the correct order
  function onAudioLoaded(position, filename) {
    console.log('Audio loaded:', position, filename);
    audioMap[position] = filename;
    console.log('Audio audioMap:', audioMap);

    // Once all segments are processed, rebuild the ordered playlist
    audioPlaylist = Object.entries(audioMap)
      .sort(([a], [b]) => Number(a) - Number(b)) // Sort by numeric position
      .map(([_, filename]) => filename); // Extract filenames

    console.log('Audio playlist:', audioPlaylist);
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
        action: 'update'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      
      console.log('Track updated successfully:', result);

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
    const userQuestion = formData.get("userQuestion") as string; // Change this line to correctly get the user input
    const type = formData.get("type") as string; // Change this line to correctly get the user input
    const developerPrompt = formData.get("developerPrompt") as string; // Change this line to correctly get the user input


    console.log("Form Data:", formData);

    console.log("Segment ID:", segmentId);
    console.log("Text:", text);
    console.log("User Question:", userQuestion); // Log userQuestion for debugging
    console.log("Type:", type); // Log type for debugging
    

    const response = await fetch(`/studio/${data.trackId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form: JSON.stringify({ text, userQuestion, developerPrompt, type, segmentId }),
        action: 'updateSegment'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      
      console.log('Segment updated successfully:', result);

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

      console.log('Segment created successfully:', result.segments);
    } else {
      console.error('Error creating segment:', result.error);
    }
  }


  console.log('data:', data);

  async function moveSegmentDown(segmentId: string) {
    // Logic for moving the segment down will be implemented here.
    console.log('Moving segment down:', segmentId);
  
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
      console.log('Segments updated successfully:', result);
    } else {
      console.error('Error moving segment down:', result.error);
    }
  }


  async function moveSegmentUp(segmentId: string) {
    // Logic for moving the segment up will be implemented here.
    console.log('Moving segment up:', segmentId);
  
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
      console.log('Segments updated successfully:', result);
    } else {
      console.error('Error moving segment down:', result.error);
    }
  }

</script>

<div>
  <a href="/studio">Back to Studio</a>
  <h1>Track: {data.track.title}</h1>
  <p>Track ID: <code>{data.track.id}</code></p>

  {#if data.track}
    <form on:submit={updateTrack}>
      <div>

        <label for="title">Title:</label>
        <input type="text" id="title" name="title" bind:value={data.track.title} placeholder="Untitled Track" />

        <label for="desc">Description:</label>
        <textarea id="desc" name="desc" bind:value={data.track.desc} placeholder="No description available"></textarea>

        <label for="accessCode">Access Code:</label>
        <input type="text" id="accessCode" name="accessCode" bind:value={data.track.accessCode} placeholder="No access code available" />

        <label for="createdDate">Created Date: {new Date(data.track.createdDate).toLocaleString()}</label>
        {#if data.track.updatedDate}
          <label for="updatedDate">Updated Date: {new Date(data.track.updatedDate).toLocaleString()}</label>
        {/if}
        
        <label for="email">Email:
        <span id="email">{data.track.email}</span></label>
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
            Position: {segment.position} {segment.id}
            <div class="move-buttons2">

              <button on:click={() => moveSegmentUp(segment.id)}>Move Up</button>
              <button on:click={() => moveSegmentDown(segment.id)}>Move Down</button>
            </div>
            <SegmentRender segment={segment} trackId={data.trackId} segmentSubmit={segmentSubmit}  onAudioLoaded={onAudioLoaded}  />
          </div>

        <!-- </li> -->
      {/each}
    <!-- </ul> -->


    <button on:click={createSegment}>Create Segment</button>


  {:else}
    <p>No track found.</p>
  {/if}


</div>