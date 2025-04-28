import { json } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';

import { newTrackUUID } from '$lib/server/utils';

const prisma = new PrismaClient();


export async function POST({ request }) {
    try {
      const { email, lookupId, action } = await request.json();

      if (action === 'create') {
        const id = await newTrackUUID();

        const newTrack = await prisma.track.create({
            data: {
                id,
                email,
                createdDate: new Date()
            }
        });

        return json({ success: true, track: newTrack });

      } else if (action === 'lookup') {
        if (!lookupId) {
            return json({ success: false, error: "No lookup ID provided" }, { status: 400 });
        }

        const track = await prisma.track.findUnique({
            where: { id: lookupId }
        });

        if (!track) {
            return json({ success: false, error: "Track not found" }, { status: 404 });
        }

        return json({ success: true, track });
      }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}