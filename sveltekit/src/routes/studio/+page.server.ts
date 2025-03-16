import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function generateUniqueUUID() {
  let uuid;
  let exists = true;

  while (exists) {
    uuid = uuidv4();
    const existing = await prisma.Episodes.findUnique({ where: { id: uuid } });
    if (!existing) exists = false;
  }
  return uuid;
}

export const actions = {
  createNew: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email');

    if (!email) {
      return { status: 400, body: { error: 'Email is required' } };
    }

    const id = await generateUniqueUUID();

    const newEpisode = await prisma.Episodes.create({
      data: {
        id,
        email,
        createdDate: new Date()
      }
    });

    return { status: 201, body: { id: newEpisode.id } };
  }
};