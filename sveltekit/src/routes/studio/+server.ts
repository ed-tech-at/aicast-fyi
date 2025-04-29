import { json } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';

import { newTrackUUID } from '$lib/server/utils';
import { requireLogin } from '$lib/server/jwt';

const prisma = new PrismaClient();


export async function POST({ request, cookies }) {
    try {
      const { newUrl, lookupId, action } = await request.json();

          const user = requireLogin(cookies);
      

      if (action === 'create') {
        const id = await newTrackUUID();

        const newTrack = await prisma.track.create({
            data: {
                id,
                URL: newUrl,
                userId: user.id,
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