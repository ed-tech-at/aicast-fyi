import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params, cookies }) => {
  
  const trackUrl = params.trackUrl as String; 

  const episode = await prisma.episode.findFirst({
    where: { id: trackUrl },
  });
  if (!episode) {
    return {
      status: 404,
      error: 'Episode not found',
    };
  }
  const episodeElements = await prisma.episodeElement.findMany({
    where: { f_episodeId: trackUrl },
    orderBy: { position: 'asc' }
  });
  return {
    episode,
    episodeElements,
  };
}