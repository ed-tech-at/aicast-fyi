import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
import { audio } from 'elevenlabs/api/resources/voices/resources/pvc/resources/samples';
// import { updated } from '$app/state';
import { requireLogin } from '$lib/server/jwt.js';
import type { Voice } from '@prisma/client';

import { error } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params, cookies }) => {

  console.log('Loading page with params:', params);
	try {

        const user = requireLogin(cookies);

  const trackId = params.trackId;

  const track = await prisma.track.findUnique({
    where: { id: trackId },
    include: {
      segments: {
        include: {
          audio: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
      // apiKeyAudio: {
      //   include: {
      //     voices: true,
      //   },
      // },
    }
  });
  if (!track) {
    throw error(404, 'Track not found');
  }
  // console.log('track', track);

  const segments = track.segments;

  // console.log('segments', segments);
  // console.log('trackId', trackId);
  // console.log('track', track);



  const apiKeys = await prisma.apiKey.findMany({
      where: {
          userId: user.id
      },
      include: {
          voices: true
      }
  });

  let voices: Voice[] = []; 


  apiKeys.forEach((key) => {
      key.key = key.key.substring(0, 15) + '***';
      if (key.id == track.apiKeyAudioId) {
          voices = key.voices;
          
      }
  });

  const episodes = await prisma.episode.findMany({
    where: { trackId: trackId },
    orderBy: {
      createdDate: 'desc',
    },
  });

  // const voices: Voice[] = track.apiKeyAudio.voices;  

  return {
    trackId,
    track,
    segments,
    voices,
    apiKeys,
    user,
    episodes
  };
  	
	} catch (err) {
		console.error('Load function failed:', err);
    
    if (err?.status === 404) {
      throw error(404, err.message || 'Track not found');
    }

		throw error(500, 'Server error');
	}
};

// export const actions: Actions = {
//   update: async ({ request, params }) => {
//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const desc = formData.get('desc') as string;
//     const trackId = params.trackId;

//     if (!title || !desc) {
//       return { status: 400, body: { error: 'Title and Description are required' } };
//     }

//     const updatedTrack = await prisma.track.update({
//       where: { id: trackId },
//       data: {
//         title,
//         desc,
//         updatedDate: new Date(),
//       },
//     });

//     return { status: 200, body: { id: updatedTrack.id } };
//   }
// };