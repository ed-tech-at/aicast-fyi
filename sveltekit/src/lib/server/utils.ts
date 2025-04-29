import { PrismaClient } from '@prisma/client';

import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function newTrackUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.track.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}

export async function newSegmentUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.segment.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}

export async function newAudioUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.audio.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}

export async function newUserUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.user.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}


export async function getMaxPosition(trackId : string) {
  const maxPosition = await prisma.segment.findFirst({
    where: { trackId: trackId },
    orderBy: { position: 'desc' },
  });
  return maxPosition ? maxPosition.position : 0;
}


export async function spaceSegmentPositionForTrack(trackId : string) {
  
  const segments = await prisma.segment.findMany({
    where: { trackId: trackId },
    orderBy: { position: 'asc' },
  });

  let position = 0;
  for (const segment of segments) {
    position += 10;
    await prisma.segment.update({
      where: { id: segment.id },
      data: { position },
    });
  }
  
}


