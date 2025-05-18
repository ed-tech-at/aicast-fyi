// src/routes/track/[trackUrl]/+page.server.ts
import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {

  const tracks = await prisma.track.findMany({
    orderBy: {
      createdDate: 'desc'
    }
  });

  return {
    
    tracks,
    date: new Date().toISOString(),
  };
};
