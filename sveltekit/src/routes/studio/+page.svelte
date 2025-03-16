<script>
  import { onMount } from 'svelte';
  let email = '';

  async function handleNew(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('email', email);

    const response = await fetch('?/createNew', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Success:', result.id);
    } else {
      console.error('Failed to add email');
    }
  }

  async function handleLookup(event) {
    event.preventDefault();
    const formData = new FormData();
    
    window.location.href = `/studio/email/${email}`;
  }

</script>

<form on:submit={handleNew}>
  New:
  <label for="email">Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <button type="submit">Submit</button>
</form>

<form on:submit={handleLookup}>
  Lookup:
  <label for="email">Email:</label>
  <input type="email" id="email" bind:value={email} required />
  <button type="submit">Submit</button>
</form>