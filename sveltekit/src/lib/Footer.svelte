<script lang="ts">
  import { onMount } from 'svelte';
  
  export let abuseMail: string | null = null;
  export let abuseSubject: string | null = null;

  let email: string | null = null;
  let mailto: string | null = null;

  onMount(() => {
      setTimeout(() => {
        const user = "abuse";
        const domain = "aicast.fyi";
        email = `${user}@${domain}`;
        mailto = `mailto:${email}`;

        if (abuseMail) {
          mailto = `mailto:${email},${abuseMail}`;
        }
        if (abuseSubject) {
          mailto += `?subject=${encodeURIComponent(abuseSubject)}`;
        }

      }, 200);
    });
</script>

<footer>
  <a href="/">Home</a>
  <a href="/studio">Studio</a>
  
  {#if abuseSubject}
    <a href={mailto} rel="external nofollow">Report Abuse &#128231;</a>
  {/if}

  <a href="/more/data-privacy">Data Privacy and Conditions for Participation</a>
  <a href="/more/imprint">Imprint</a>
</footer>