import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';
const prisma = new PrismaClient();

import { error } from '@sveltejs/kit';


export const load: PageServerLoad = async ({ params }) => {
  const trackUrl = params.trackUrl as string;
  const email = params.email as string;

  const user = await prisma.user.findFirst({
    where: { email },
  });

  let track = await prisma.track.findFirst({
    where: { userId: user?.id, URL: trackUrl },
    include: {
      apiKeyAudio: {
        include: {
          voices: true,
        },
      },
    }
  });

  if (!track) {
    throw error(404, 'Track not found');
  }

  // Safely check if accessCode exists and has a length
  const accessCodeRequired = track.accessCode && track.accessCode.length > 0;

  // Mask the access code for security
  
  const voices = track.apiKeyAudio?.voices || [];

  // keep from track only title, desc and id
  track = {
    id: track.id,
    title: track.title,
    desc: track.desc,
  };


  return {
    email,
    trackUrl,
    track,
    voices,
    accessCodeRequired,
  };
};