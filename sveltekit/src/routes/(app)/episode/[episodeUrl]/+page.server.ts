// src/routes/track/[trackUrl]/+page.server.ts
import { checkAudioForTextAndVoice } from "$lib/server/audio";
import type { PageServerLoad } from "./$types";
import { error } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';
import type { Voice } from '@prisma/client';
const prisma = new PrismaClient();


export const load: PageServerLoad = async ({ params }) => {

    const episodeUrl = params.episodeUrl as string;
    console.log('Loading episode with URL:', episodeUrl);

    const episode = await prisma.episode.findFirst({
        where: { id: episodeUrl },
        include: {
            track: {
                include: {
                    segments: {
                        
                        orderBy: {
                            position: 'asc',
                        },
                    },
                    user: true,
                },
            },
        },
    });


    let episodeData: { fileName: string; text: string, type: string }[] = [];

    if (!episode) {
        throw error(404, 'Episode not found');
    }
    const track = {
        id: episode?.track.id,
        URL: episode?.track.URL,
        email: episode?.track.user.email,
        title: episode?.track.title,
        desc: episode?.track.desc
    }

    const abuseMail = episode?.track.user.email;
    
    const episodeAnswers = JSON.parse(episode?.answers || '{}');

    // console.log('episodeAnswers', episodeAnswers);
    // console.log('episode', episode);

    for (const segment of episode.track.segments) {
        console.log('segment', segment);
        if (segment.type === 'text') {

            const existingAudio = await checkAudioForTextAndVoice(segment.text, episode?.voice_id);

            if (existingAudio) {
                episodeData.push({
                    fileName: existingAudio,
                    text: segment.text,
                    type: segment.type
                });
            }
        } else if (segment.type === 'ai') {

            const studentAnswer = episodeAnswers[segment.studentQuestion];
            console.log('studentAnswer', studentAnswer);

            

            const llmText = await prisma.lLMGeneratedText.findFirst({
                where: { segmentId: segment.id, studentAnswer: studentAnswer, systemPrompt: episode.systemPrompt
                    
                 },
                  orderBy: { createdDate: 'desc' },
            });

            console.log('llmText for this: ', llmText.result);
            const existingAudio = await checkAudioForTextAndVoice(llmText.result, episode?.voice_id);
            if (existingAudio) {
                episodeData.push({
                    fileName: existingAudio,
                    text: llmText?.result,
                    type: segment.type
                });
            } else {
                console.log('warning: No audio found for this segment');
            }
        }

    }


    return {
        episodeData,
        episodeUrl,
        abuseMail,
        track,
    };
};
