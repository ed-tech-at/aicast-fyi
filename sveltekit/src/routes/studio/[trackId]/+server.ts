import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

import { newSegmentUUID, getMaxPosition, spaceSegmentPositionForTrack } from '$lib/server/utils';
import { get } from 'svelte/store';

import fs from 'fs';
import path from 'path';

import { generateAudio } from '$lib/server/audio';
import { generateLLMResponse } from '$lib/server/llm.js';

const voiceIdM = "NBqeXKdZHweef6y0B67V"; // Replace with actual voice ID
// const voiceIdF = "Z3R5wn05IrDiVCyEkUrK"; // Replace with actual voice ID
const voiceIdF = "uvysWDLbKpA4XvpD3GI6"; // Replace with actual voice ID

const prisma = new PrismaClient();

export async function POST({ request, params }) {
    try {
        console.log('params', params);
        let { form, action, segmentId } = await request.json();
        console.log('action', action);
        
        if (typeof form === 'string') {
            form = JSON.parse(form);
        }

        const trackId = params.trackId;

        console.log('form', form);

        if (action == "update") {
            console.log('title', form);
            

            // if (!title || !desc) {
                // return json({ success: false, error: 'Title and Description are required' }, { status: 400 });
            // }

            const updatedTrack = await prisma.track.update({
                where: { id: trackId },
                data: {
                    title: form.title,
                    desc: form.desc,
                    accessCode: form.accessCode,
                    updatedDate: new Date(),
                },
            });

            return json({ success: true, track: updatedTrack });

        }
        if (action == "updateSegment") {
            console.log('update segment', form.segmentId);
            const segmentId = form.segmentId;

            // if (!title || !desc) {
                // return json({ success: false, error: 'Title and Description are required' }, { status: 400 });
            // }

            const oldSegment = await prisma.segment.findUnique({
                where: { id: segmentId },
            });


            if (oldSegment?.text !== form.text) {
                await prisma.segment.update({
                    where: { id: segmentId },
                    data: {
                        audioId: null,
                    }
                });
            }
            
            const updatedSegment = await prisma.segment.update({
                where: { id: segmentId },
                data: {
                    text: form.text,
                    studentQuestion: form.studentQuestion,
                    systemPrompt: form.systemPrompt,
                    type: form.type,
                },
            });

            const updatedSegments = await prisma.segment.findMany({
                where: { trackId: trackId },
                orderBy: { position: 'asc' }
            });
    
            return json({ success: true, segments: updatedSegments });

        } else if (action == 'createSegment') {
        console.log('createSegment!');

        const position = await getMaxPosition(trackId) + 10;

        const uuid = await newSegmentUUID();

        const newSegment = await prisma.segment.create({
            data: {
                trackId: trackId,
                id: uuid,
                createdDate: new Date(),
                position: position,
                type: 'text',
            }
        });

        console.log('newSegment', newSegment);

        // / Fetch updated segments
        const updatedSegments = await prisma.segment.findMany({
            where: { trackId: trackId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, segments: updatedSegments });


      } else if (action == "moveDown") {


        
        console.log('segmentId::', segmentId);
        const trackId = params.trackId;

        const segment = await prisma.segment.update({
            where: { id: segmentId },
            data: {
                position: { increment: 15 }
            }
            });
        


        await spaceSegmentPositionForTrack(trackId);

         // / Fetch updated segments
        const updatedSegments = await prisma.segment.findMany({
            where: { trackId: trackId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, segments: updatedSegments });

      } else if (action == "moveUp") {


        
        console.log('segmentId::', segmentId);
        const trackId = params.trackId;

        const segment = await prisma.segment.update({
            where: { id: segmentId },
            data: {
                position: { decrement: 15 }
            }
            });
        


        await spaceSegmentPositionForTrack(trackId);

         // / Fetch updated segments
        const updatedSegments = await prisma.segment.findMany({
            where: { trackId: trackId },
            orderBy: { position: 'asc' }
        });

        return json({ success: true, segments: updatedSegments });

      } else if (action === "checkAudioGenerated") {
        console.log('Checking audio cache for text:', form.text);

        const existingAudio = await prisma.audio.findFirst({
            where: {
                text: form.text,
                voice_id: form.voiceId
            }
        });

        if (existingAudio) {
            console.log('Audio is already generated in checkAudioGenerated:', existingAudio.id);

            await prisma.segment.update({
                where: { id: form.segmentId },
                data: {
                    audioId: existingAudio.id
                }
            });


            // const AUDIO_DIR = path.join(process.cwd(), 'static', 'data', 'audio'); // Directory for storing MP3s
            
            // const existingAudioPath = path.join(AUDIO_DIR, `${existingAudio.id}.mp3`);
            // // console.log(`1. Returning existing audio file: ${existingAudioPath}`);
            // if (fs.existsSync(existingAudioPath)) {
            //     console.log(`Returning existing audio file: ${existingAudioPath}`);
            //     // return {filename: `${existingAudio.id}.mp3`, cached: true}; // Return the existing file
            // }

            return json({ success: true, cached: true, filename: `${existingAudio.folder}/${existingAudio.id}.mp3` });
        }
         else {
            // console.log('Audio not found, generating new audio...');
            // const generatedAudioFilename = await generateAudio(form.text, form.voiceId, form.segmentId);
            // return json({ success: true, cached: false, filename: generatedAudioFilename });
            return json({ success: false, cached: false, filename: null });
        }
    } else if (action === "checkAudioVersion") {
        console.log('Checking audio cache for text:', form.text);

        const existingAudio = await prisma.audio.findFirst({
            where: {
                text: form.text,
                voice_id: form.voiceId
            }
        });

        if (existingAudio) {
            console.log('Audio is already generated in checkAudioGenerated:', existingAudio.id);

            // await prisma.segment.update({
            //     where: { id: form.segmentId },
            //     data: {
            //         audioId: existingAudio.id
            //     }
            // });


            // const AUDIO_DIR = path.join(process.cwd(), 'static', 'data', 'audio'); // Directory for storing MP3s
            
            // const existingAudioPath = path.join(AUDIO_DIR, `${existingAudio.id}.mp3`);
            // // console.log(`1. Returning existing audio file: ${existingAudioPath}`);
            // if (fs.existsSync(existingAudioPath)) {
            //     console.log(`Returning existing audio file: ${existingAudioPath}`);
            //     // return {filename: `${existingAudio.id}.mp3`, cached: true}; // Return the existing file
            // }

            return json({ success: true, cached: true, filename: `${existingAudio.folder}/${existingAudio.id}.mp3` });
        }
         else {
            // console.log('Audio not found, generating new audio...');
            // const generatedAudioFilename = await generateAudio(form.text, form.voiceId, form.segmentId);
            // return json({ success: true, cached: false, filename: generatedAudioFilename });
            return json({ success: false, cached: false, filename: null });
        }
    } else if (action === "generateAudio") {

            console.log('Audio not found, generating new audio...');
            const { filename2, cached2 } = await generateAudio(form.text, voiceIdF, form.segmentId);
            const { filename, cached } = await generateAudio(form.text, voiceIdM, form.segmentId);
            return json({ success: true, cached: cached, filename: filename });
        
     } else if (action === "generateLLMResponse") {

            console.log('Generating LLM response... for dev' + form.developerPrompt);
            
            const { response } = await generateLLMResponse(form.developerPrompt, form.userDemoInput, form.segmentId);
            return json({ success: true, response: response });
        
     }
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
