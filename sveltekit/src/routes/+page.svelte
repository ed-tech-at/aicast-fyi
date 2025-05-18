<script lang="ts">
  import Footer from '$lib/Footer.svelte';


</script>

<main>

<div
style="text-align: center; font-family: 'Arial'">

  <h1>aicast.fyi</h1>
  <img src="/logo/aicast_v1-anim.svg" alt="aicast.fyi" width="25%" />

  <div style="text-align: left;">
    <h2>Personalized Educational Podcasts</h2>
    
    <p>We combine instructor-defined content with AI personalization.</p>


    <hr style="margin: 3rem;" />
    <h2>Want to create your own aicast?</h2>
    <p>
      You can register for free and create your own personalized podcasts. <a href="/register" class="button small">Register here</a>
      
    </p>
    <p>
      This software is open-source, and you can find the code on <a href="https://github.com/ed-tech-at/aicast-fyi" target="_blank">GitHub</a>.

      You can use our aicast.fyi server for free, but you have to provide your own API keys from <a href="https://platform.openai.com/" target="_blank">OpenAI</a> and <a href="https://elevenlabs.io/" target="_blank">ElevenLabs</a>. At the repository, you can find instructions on how to set up your own server running on docker.
    </p>

  </div>


  
</div>
</main>

<Footer />