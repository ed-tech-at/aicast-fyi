import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
// import { updated } from '$app/state';



const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {
  const trackId = params.trackId;

  const audios = await prisma.audio.findMany({
    orderBy: { createdDate: 'desc' }
  });

  
  return {
    audios,
    date: new Date().toISOString(),
  };
};
