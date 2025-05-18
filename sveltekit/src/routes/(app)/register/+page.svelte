<script lang="ts">
  
  let email = "";
  let password = "";
  let error = "";
  let agree = false;
  let loading = false;
//   import Header from '$lib/Header.svelte';
  import { browser } from '$app/environment';
    import Footer from '$lib/Footer.svelte';

  import type { JwtUserPayload } from '$lib/server/jwt';

  export let data: { user: JwtUserPayload }; 


let userId = "";
if (browser) {
    if (data.user) {
      window.location.href = "/studio";
    }
//   userId = localStorage.getItem("userId");
//   console.log("Benutzer-ID:", userId);
//   if (userId) {
    //   window.location.href = "/profil";
    // }
}

  async function handleRegister() {
      error = "";
      loading = true;

      if (!email || !password) {
          error = "Both fields are required.";
          loading = false;
          return;
      }


      if (!agree) {
          error = "Please agree to the terms of use.";
          loading = false;
          return;
      }

      try {
            const formData = {
                email,
                password,
            };
          const response = await fetch("/register", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({
                  formData,
                  action: 'register'
              }),
          });

          const data = await response.json();
          
          if (response.ok && data.success) {

            window.location.href = "/studio";
            // console.log("Benutzer erfolgreich angemeldet:", data.user);
            //   localStorage.setItem("userId", data.user.id);
            //   localStorage.setItem("userEmail", data.user.email);

            //   console.log("Benutzer-ID:", data.user);
            //   if (data.user.isAdmin) {
            //       localStorage.setItem("isAdmin", data.user.isAdmin);
            //   }
            //   // Redirect to the dashboard or home page after successful login
            //   window.location.href = "/dashboard"; // Add this line for redirection
          } else {
              error = data.error || "Failed to register. Please try again.";
          }
      } catch (err) {
          error = "An error occurred. Please try again later.";
          console.error(err);
      } finally {
          loading = false;
      }
  }
</script>

<main>

<div class="registerBg">
  <div class="registerBlock">
      <h2>Register</h2>
      {#if error}
          <div class="error-message">{error}</div>
      {/if}
      <form on:submit|preventDefault={handleRegister}>
          <div class="form-group">
              <label for="email">Email Address</label>
              <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  bind:value={email}
                  required
              />
          </div>
          <div class="form-group">
              <label for="password">Password</label>
              <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  bind:value={password}
                  required
              />
          </div>

          <div class="checkbox-form">
              <label>
                The participation is voluntary.<br>
                The entered data will be evaluated for scientific purposes.<br>
                  <input type="checkbox" bind:checked={agree} required style="width: auto;" />
                  I have read and accept the <a href="/more/data-privacy" target="_blank">data protection and participation conditions</a>.

              </label>
          </div> 

          <button type="submit" class="login-button" disabled={loading}>
              {#if loading}
                  <div class="loader"></div>
              {/if}
              {!loading ? "Register" : "Registering..."}
          </button>
      </form>
      <div class="alt-links">

          <!-- <a style="color: var(--color-complementary);"  href='/passwort'>Forgot Password</a> -->

          <p>You have an account?</p>
          <a href="/login" class="button invert">Login</a>
      </div>
  </div>
</div>

</main>

<Footer />