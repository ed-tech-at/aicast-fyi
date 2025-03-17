import { PrismaClient } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function newEpisodeUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.episode.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}

export async function newEpisodeElementUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.episodeElement.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}


export async function getMaxPosition(episodeId : string) {
  const maxPosition = await prisma.episodeElement.findFirst({
    where: { f_episodeId: episodeId },
    orderBy: { position: 'desc' },
  });
  return maxPosition ? maxPosition.position : 0;
}


export async function spaceElementPositionForEpisode(episodeId : string) {
  
  const elements = await prisma.episodeElement.findMany({
    where: { f_episodeId: episodeId },
    orderBy: { position: 'asc' },
  });

  let position = 0;
  for (const element of elements) {
    position += 10;
    await prisma.episodeElement.update({
      where: { id: element.id },
      data: { position },
    });
  }
  
}


