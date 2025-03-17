import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

import { newEpisodeElementUUID, getMaxPosition, spaceElementPositionForEpisode } from '$lib/server/utils';
import { get } from 'svelte/store';

import { generateAudio } from '$lib/server/audio';
import { generateLLMResponse } from '$lib/server/llm.js';

const prisma = new PrismaClient();

export async function POST({ request, params }) {
    try {
        console.log('params', params);
        let { form, action, elementId } = await request.json();
        console.log('action', action);
        
        if (typeof form === 'string') {
            form = JSON.parse(form);
        }

        const episodeId = params.episodeId;

        console.log('form', form);

        if (action == "update") {
            console.log('title', form.title);
            

            // if (!title || !desc) {
                // return json({ success: false, error: 'Title and Description are required' }, { status: 400 });
            // }

            const updatedEpisode = await prisma.episode.update({
                where: { id: episodeId },
                data: {
                    title: form.title,
                    desc: form.desc,
                    updatedDate: new Date(),
                },
            });

            return json({ success: true, episode: updatedEpisode });

        }
        if (action == "updateElement") {
            console.log('update element', form.elementId);
            const elementId = form.elementId;

            // if (!title || !desc) {
                // return json({ success: false, error: 'Title and Description are required' }, { status: 400 });
            // }
            
            const updatedElement = await prisma.episodeElement.update({
                where: { id: elementId },
                data: {
                    text: form.text,
                    userQuestion: form.userQuestion,
                    developerPrompt: form.developerPrompt,
                    type: form.type,
                },
            });

            const updatedElements = await prisma.episodeElement.findMany({
                where: { f_episodeId: episodeId },
                orderBy: { position: 'asc' }
            });
    
            return json({ success: true, episodeElements: updatedElements });

        } else if (action == 'createElement') {
        console.log('createElement!');

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

      } else if (action === "checkAudioGenerated") {
        console.log('Checking audio cache for text:', form.text);

        const existingAudio = await prisma.audio.findFirst({
            where: {
                text: form.text,
                voice_id: form.voiceId
            }
        });

        if (existingAudio) {
            console.log('Audio is already generated:', existingAudio.id);
            return json({ success: true, cached: true, filename: `${existingAudio.id}.mp3` });
        }
         else {
            // console.log('Audio not found, generating new audio...');
            // const generatedAudioFilename = await generateAudio(form.text, form.voiceId, form.elementId);
            // return json({ success: true, cached: false, filename: generatedAudioFilename });
            return json({ success: false, cached: false, filename: null });
        }
    } else if (action === "generateAudio") {

            console.log('Audio not found, generating new audio...');
            const { filename, cached } = await generateAudio(form.text, form.voiceId, form.elementId);
            return json({ success: true, cached: cached, filename: filename });
        
     } else if (action === "generateLLMResponse") {

            console.log('Generating LLM response... for dev' + form.developerPrompt);
            
            const { response } = await generateLLMResponse(form.developerPrompt, form.userDemoInput, form.elementId);
            return json({ success: true, response: response });
        
     }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
