import { json } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';

import { newEpisodeUUID } from '$lib/server/utils';

const prisma = new PrismaClient();


export async function POST({ request }) {
    try {
      const { email, lookupId, action } = await request.json();

      if (action === 'create') {
        const id = await newEpisodeUUID();

        const newEpisode = await prisma.episode.create({
            data: {
                id,
                email,
                createdDate: new Date()
            }
        });

        return json({ success: true, episode: newEpisode });

      } else if (action === 'lookup') {
        if (!lookupId) {
            return json({ success: false, error: "No lookup ID provided" }, { status: 400 });
        }

        const episode = await prisma.episode.findUnique({
            where: { id: lookupId }
        });

        if (!episode) {
            return json({ success: false, error: "Episode not found" }, { status: 404 });
        }

        return json({ success: true, episode });
      }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}