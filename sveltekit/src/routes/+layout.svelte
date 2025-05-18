<script>
  import { onMount } from 'svelte';
  import './main.css'; // Reintroducing the studio.css for styling
</script>

<svelte:head>
  <link rel="icon" href="/logo/aicast_v1.png" type="image/png" />
  <link rel="shortcut icon" href="/logo/aicast_v1.png" type="image/png" />
</svelte:head>


<div class="page-wrapper">
<slot />
</div>