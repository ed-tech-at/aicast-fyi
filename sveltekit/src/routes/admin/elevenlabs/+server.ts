import { json } from '@sveltejs/kit';
import { generateAudio } from '$lib/server/audio';

export async function POST({ request }) {
    try {
        const { text, voiceId } = await request.json();

        if (!text ||  !voiceId) {
            return json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const { filename , cached } = await generateAudio(text, voiceId, "2");

        return json({ success: true, filename, cached });

    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
