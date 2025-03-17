import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

import { newEpisodeElementUUID, getMaxPosition, spaceElementPositionForEpisode } from '$lib/server/utils';
import { get } from 'svelte/store';


const prisma = new PrismaClient();

export async function POST({ request, params }) {
    try {
        console.log('params', params);
        const { title, desc, action, elementId } = await request.json();
        console.log('action', action);
        if (action == "update") {
        console.log('title', title);
        const episodeId = params.episodeId;

        // if (!title || !desc) {
            // return json({ success: false, error: 'Title and Description are required' }, { status: 400 });
        // }

        const updatedEpisode = await prisma.episode.update({
            where: { id: episodeId },
            data: {
                title,
                desc,
                updatedDate: new Date(),
            },
        });

        return json({ success: true, episode: updatedEpisode });

      } else if (action == 'createElement') {
        console.log('createElement!');
        const episodeId = params.episodeId;

        const position = await getMaxPosition(episodeId) + 10;

        const uuid = await newEpisodeElementUUID();

        const newElement = await prisma.episodeElement.create({
            data: {
                f_episodeId: episodeId,
                id: uuid,
                createdDate: new Date(),
                position: position,
                type: 'text',
            }
        });

        console.log('newElement', newElement);

        // / Fetch updated elements
        const updatedElements = await prisma.episodeElement.findMany({
            where: { f_episodeId: episodeId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, episodeElements: updatedElements });


      } else if (action == "moveDown") {


        
        console.log('elementId::', elementId);
        const episodeId = params.episodeId;

        const element = await prisma.episodeElement.update({
            where: { id: elementId },
            data: {
                position: { increment: 15 }
            }
            });
        


        await spaceElementPositionForEpisode(episodeId);

         // / Fetch updated elements
        const updatedElements = await prisma.episodeElement.findMany({
            where: { f_episodeId: episodeId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, elements: updatedElements });

      } else if (action == "moveUp") {


        
        console.log('elementId::', elementId);
        const episodeId = params.episodeId;

        const element = await prisma.episodeElement.update({
            where: { id: elementId },
            data: {
                position: { decrement: 15 }
            }
            });
        


        await spaceElementPositionForEpisode(episodeId);

         // / Fetch updated elements
        const updatedElements = await prisma.episodeElement.findMany({
            where: { f_episodeId: episodeId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, elements: updatedElements });

      }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
