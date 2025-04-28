import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params, cookies }) => {
  
  const trackUrl = params.trackUrl as String; 

  const track = await prisma.track.findFirst({
    where: { id: trackUrl },
  });
  if (!track) {
    return {
      status: 404,
      error: 'Track not found',
    };
  }
  const segments = await prisma.segment.findMany({
    where: { f_trackId: trackUrl },
    orderBy: { position: 'asc' }
  });
  return {
    track,
    segments,
  };
}