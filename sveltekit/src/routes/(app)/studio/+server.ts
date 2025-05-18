import { json } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';

import { newTrackUUID } from '$lib/server/utils';
import { requireLogin } from '$lib/server/jwt';

const prisma = new PrismaClient();


export async function POST({ request, cookies }) {
    const user = requireLogin(cookies);

    try {
      const { newUrl, lookupId, action, apiKeyId,  apiKey, endpoint, newVoice } = await request.json();

          const user = requireLogin(cookies);
      

      if (action === 'createTrack') {
        const id = await newTrackUUID();

        const openAiKey = await prisma.apiKey.findFirst({
            where: {
                userId: user.id,
                endpoint: 'openai'
            },
            orderBy: {
                createdDate: 'desc'
            }
        });
        const elevenLabsKey = await prisma.apiKey.findFirst({
            where: {
                userId: user.id,
                endpoint: 'elevenlabs'
            },
            orderBy: {
                createdDate: 'desc'
            }
        });


        const newTrack = await prisma.track.create({
            data: {
                id,
                URL: newUrl,
                userId: user.id,
                apiKeyLLMId: openAiKey ? openAiKey.id : null,
                apiKeyAudioId: elevenLabsKey ? elevenLabsKey.id : null,
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
      } else if (action == 'deleteApiKey') {
        
        const apiKey = await prisma.apiKey.findUnique({
            where: { id: apiKeyId }
        });

        if (!apiKey) {
            return json({ success: false, error: "API Key not found" }, { status: 404 });
        }

        await prisma.apiKey.delete({
            where: { id: apiKeyId }
        });

        return json({ success: true, message: "API Key deleted" });

      } else if (action == 'addApiKey') {
        

        if (endpoint == "shortcode") {
            const shortcodeKeys = await prisma.apiKey.findMany({
                where: {
                    shortcode: apiKey,
                    userId: null
                },
                include: {
                    voices: true
                }
            });
            
            for (const key of shortcodeKeys) {
                const newKey = await prisma.apiKey.create({
                    data: {
                        key: key.key,
                        endpoint: key.endpoint,
                        shortcode: key.shortcode,
                        userId: user.id,
                        createdDate: new Date()
                    }
                });
                if (key.voices) {
                    for (const voice of key.voices) {
                        await prisma.voice.create({
                            data: {
                                displayName: voice.displayName,
                                voice_id: voice.voice_id,
                                apiKeyId: newKey.id,
                                language_code: voice.language_code
                            }
                        });
                    }
                }
            }
            return json({ success: true, message: "API Key added" });
        }
        
        const newApiKey = await prisma.apiKey.create({
          data: {
            key: apiKey,
            endpoint: endpoint,
            userId: user.id,
            createdDate: new Date()
          }
        });

        return json({ success: true, apiKey: newApiKey });

      } else if (action == 'addVoice') {
        if (!newVoice) {
            return json({ success: false, error: "No voice provided" }, { status: 400 });
        }

        const apiKey = await prisma.apiKey.findUnique({
            where: { id: apiKeyId }
        });

        if (!apiKey) {
            return json({ success: false, error: "API Key not found" }, { status: 404 });
        }

        const newVoiceEntry = await prisma.voice.create({
            data: {
                displayName: newVoice.displayName,
                voice_id: newVoice.voice_id,
                apiKeyId: apiKey.id,
                language_code: newVoice.language_code
            }
        });

        return json({ success: true, voice: newVoiceEntry });

      } else if (action == 'removeVoice') {
        const voice = await prisma.voice.findFirst({
            where: { voiceInt: newVoice.voiceInt }
        });

        if (!voice) {
            return json({ success: false, error: "Voice not found" }, { status: 404 });
        }

        await prisma.voice.delete({
            where: { voiceInt: voice.voiceInt }
        });

        return json({ success: true, message: "Voice deleted" });

      }

    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}