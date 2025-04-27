import { json } from '@sveltejs/kit';
import { generateAudio } from '$lib/server/audio';

import { env } from '$env/dynamic/private';


export async function POST({ request }) {
    try {

        const  {formData, action} = await request.json();
        if (action === "voicesList") {
            const voices = await fetchVoices();
            return json({ success: true, voices });
        }

        if (action === "generateAudio") {
          

            const { text, voiceId } = formData;

            if (!text ||  !voiceId) {
                return json({ success: false, error: "Missing parameters" }, { status: 400 });
            }

            const { filename , cached } = await generateAudio(text, voiceId, "2");

            return json({ success: true, filename, cached });
        } 
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }


    
}


async function fetchVoices() {
    let voices = [];

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': env.ELEVENLABS_API_KEY
        }
      });

      const result = await response.json();
      voices = result.voices || []; // Store voices list
      console.log('Fetched voices:', voices);
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
    return voices;
  }