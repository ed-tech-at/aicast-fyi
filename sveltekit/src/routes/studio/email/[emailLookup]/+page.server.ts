// src/routes/episode/[episodeUrl]/+page.server.ts
import { PrismaClient } from '@prisma/client';
import type { PageServerLoad } from './$types';

const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {
  const emailLookup = params.emailLookup;

  const episodes = await prisma.episodes.findMany({
    where: { email: emailLookup },
  });

  return {
    emailLookup,
    episodes,
    date: new Date().toISOString(),
  };
};
