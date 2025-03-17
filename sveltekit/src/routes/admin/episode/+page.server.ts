// src/routes/episode/[episodeUrl]/+page.server.ts
import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {

  const episodes = await prisma.episode.findMany({
    orderBy: {
      createdDate: 'desc'
    }
  });

  return {
    
    episodes,
    date: new Date().toISOString(),
  };
};
