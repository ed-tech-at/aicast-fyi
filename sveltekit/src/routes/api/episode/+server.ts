import { requireLogin } from '$lib/server/jwt.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { json } from '@sveltejs/kit';

import { checkOrGenerateLLMResponse } from '$lib/server/llm.js';
import { generateAudio } from '$lib/server/audio';


export async function POST({ request, cookies }) {
  try {
    const { formData, action } = await request.json();

    // requireLogin(cookies);
    if (action == 'createEpisode') {
      const { fragen, trackId, accessCode, voiceId, voiceInt } = formData;


      const track = await prisma.track.findFirst({
        where: { id: trackId },
        include: {
          segments: {
            orderBy: {
              position: 'asc',
            },
          },
        },
      });

      if (!track) {
        return json({
          status: 404,
          error: 'Track not found',
        });
      }
      let accessCodes: string[] = [];
      if (track?.accessCode) {
        accessCodes = track.accessCode.split('\n');
      }
      if (accessCodes.length > 0 && !accessCodes.includes(accessCode)) {
        return json({
          status: 403,
          error: 'Access code is incorrect, retry.',
        });
      }


      const episode = await prisma.episode.create({
        data: {
          answers: JSON.stringify(fragen),
          trackId,
          studentName: accessCode,
          voice_id: voiceId,
        },
      });

      let segments = track?.segments || [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (segment.type == 'ai') {
          const studentAnswer = fragen[segment.studentQuestion];
          const systemPrompt = segment.systemPrompt;
          const segmentId = segment.id;

          let { response, cached: responseCached } = await checkOrGenerateLLMResponse(systemPrompt, studentAnswer, segmentId);

          console.log('response:', response, responseCached);

          let { filename, cached } = await generateAudio(response, voiceId, voiceInt, segmentId);

        } else if (segment.type == 'text') {
          let { filename, cached } = await generateAudio(segment.text, voiceId, voiceInt, segment.id);

        }

      }
      
      return json({ success: true, episode });
      
    } else if (action == 'getEpisodeVoiceDemo') {
      const { trackId, voiceId, voiceInt } = formData;

      

      const segment = await prisma.segment.findFirst({
        where: { trackId: trackId },
        orderBy: {
          position: 'asc',
        },
        include: {
          track: true,
        },
      });

      // const text = "Willkommen bei: " + segment?.track.title;
      const text = "a-i-cast track: " + segment?.track.title;

      const { filename, cached } = await generateAudio(text, voiceId, voiceInt, segment?.id);
      return json({ success: true, filename });
    }


  } catch (error) {
      console.error('Error creating episode:', error);
      return json({ success: false, error: 'Ein Fehler ist aufgetreten.' }, { status: 500 });
  }

}