<script lang="ts">
  import Footer from '$lib/Footer.svelte';

  import { page } from '$app/state';


</script>

<main>
<div class="container">
  <div class="badge-shadow">
    <h1>{page.status} {page.error.message}</h1>
    <!-- <h1>{pageError?.status ?? 500}</h1> -->
    <!-- <div class="subtitle">Uups – das ging schief.</div> -->

    <!-- <div class="details">

      {page.error?.}
    </div> -->
<p>

  <a href="/" class="link">Back to Home</a>
</p>
  </div>
</div>
</main>

<Footer />