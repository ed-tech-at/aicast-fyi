import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import { hashString } from './utils'; // Import the hashString function


const prisma = new PrismaClient(); // Initialize Prisma Client
const AUDIO_DIR = path.join(process.cwd(), 'data', 'audio'); // Directory for storing MP3s

// console.log("Current working directory:", process.cwd());

import { env } from '$env/dynamic/private';

import {newAudioUUID} from './utils';

// Ensure the directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

export async function checkAudioForTextAndVoice(
    text: string,
    voiceId: string,
    hashTextGiven: string | null = null
): Promise<string | null> {


    let hashedText = hashString(text);

    if (hashTextGiven) {
        hashedText = hashTextGiven;
    }


    console.log('checkAudioForTextAndVoice: text', text);
    console.log('voiceId', voiceId);
    console.log('hashedText', hashedText);

    const existingAudio = await prisma.audio.findFirst({
        where: {
            hashText: hashedText,
            voice_id: voiceId
        }
    });

    // console.log('existingAudio', existingAudio);

    if (existingAudio != null) {

        
        // console.log('existingAudio.folder', existingAudio.folder);
        // console.log('existingAudio.id', existingAudio.id);

        const existingAudioPath = path.join(AUDIO_DIR, existingAudio.folder, `${existingAudio.id}.mp3`);


        console.log(`1YES Returning existing audio file: ${existingAudioPath}`);
        if (fs.existsSync(existingAudioPath)) {
            // console.log(`Returning existing audio file: ${existingAudioPath}`);
            return `${existingAudio.folder}/${existingAudio.id}.mp3`; // Return the existing file
        }

    }
    return null; // No existing audio found
}

/**
 * Generates or retrieves audio for a given text and voice.
 * 
 * - If the audio file already exists in the database, return the existing file path.
 * - If not, generate a new audio file, store it, and save metadata in the database.
 * 
 * @param text - The text to be converted into speech.
 * @param voiceId - The ID of the ElevenLabs voice to use.
 * @param segmentId - The ID of the related Segment.
 * @returns {Promise<string>} - The path to the saved or existing audio file.
 */
export async function generateAudio(
    text: string,
    voiceId: string,
    voiceInt: number,
    segmentId: string
): Promise<{filename: string; cached: boolean}> {
    try {
        if (!text || !voiceId || !segmentId) {
            throw new Error('Text, voiceId, and segmentId are required');
        }

        // Check if an audio file already exists for the given text and voiceId
        const existingAudio = await checkAudioForTextAndVoice(text, voiceId);

        if (existingAudio != null) {
            console.log('Existing audio found, returning cached file...');
            console.log('existingAudio', existingAudio);
            return { filename: existingAudio, cached: true }; 
        }

        console.log('No existing audio found, generating new audio...');
        console.log('text', text);
        console.log('voiceId', voiceId);


        // return;

        // Generate and save new audio if not found
        const newFile = await generateAndSaveAudio(text, voiceId, voiceInt, segmentId);



        return { filename: newFile, cached: false }; // Return newly generated file


    } catch (error) {
        console.error("Error in generateAudio:", error);
        throw error;
    }
}

/**
 * Generates speech using ElevenLabs API, saves it as an MP3, and stores metadata in the database.
 * 
 * @param text - The text to be converted into speech.
 * @param voiceId - The ID of the ElevenLabs voice to use.
 * @param segmentId - The ID of the related Segment.
 * @returns {Promise<string>} - The path to the saved audio file.
 */
export async function  generateAndSaveAudio(
    text: string,
    voiceId: string,
    voiceInt: number,
    // language_code: string,
    // previous_text: string,
    // next_text: string,
    segmentId: string
): Promise<string> {
    try {
        // Create a new audio record in the database
        const newAudioId = await newAudioUUID();

        // Generate a string in the format "yyyy-mm"
        const currentDate = new Date();
        const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        const voice = await prisma.voice.findFirst({
            where: {
                voiceInt: voiceInt
            }
        });

        const segment = await prisma.segment.findUnique({
            where: { id: segmentId },
            include: {
                track: {
                    include: {
                        apiKeyAudio: true, // Fetch the ApiKey associated with the Track
                    },
                },
            },
        });

        const track = segment?.track;
        const apiKey = track?.apiKeyAudio?.key;
        if (!apiKey) {
            throw new Error('API key is required for ElevenLabs API');
        }

        console.log('apiKey', apiKey);

        console.log('voice', voice);
    

        const newAudio = await prisma.audio.create({
            data: {
                segmentCreatedId: segmentId,
                voice_id: voiceId,
                hashText: hashString(text),
                folder: yearMonth,
                text: text,
                // previousText: previous_text,
                // nextText: next_text,
                language_code: voice?.language_code,
                id: newAudioId
            }
        });

        



        const audioPath = path.join(AUDIO_DIR, yearMonth, `${newAudio.id}.mp3`); // Use UUID as filename

        // console.log(`Generating speech for: "${text}". Voice: ${voiceId}`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: text,
                voice_id: voiceId,
                // model_id: "eleven_monolingual_v1",
                language_code: voice?.language_code,
                model_id: "eleven_v2_5_flash",
                output_format: "mp3"
            })
        });

        if (!response.ok) {
            console.error('Error response from ElevenLabs API:', response.statusText);
            console.error('Response body:', await response.text());
            console.error('text', text);
            console.error('voiceId', voiceId);
            console.error('voice', voice);
            console.error('language_code', voice?.language_code);
            console.error('model_id', "eleven_v2_5_flash");
            console.error('apiKey', apiKey);
            throw new Error(`Failed to generate audio: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer(); // Get audio as a binary buffer

        // Ensure the subfolder exists before saving the file
        const audioFolder = path.dirname(audioPath);
        if (!fs.existsSync(audioFolder)) {
            fs.mkdirSync(audioFolder, { recursive: true });
        }

        fs.writeFileSync(audioPath, Buffer.from(audioBuffer)); // Save MP3 file

        await prisma.segment.update({
            where: { id: segmentId },
            data: {
                audioId: newAudio.id,
            }
        });

        // console.log(`Saved new audio file: ${audioPath}`);

        return `${yearMonth}/${newAudio.id}.mp3`; // Return the saved file path

    } catch (error) {
        console.error("Error generating audio:", error);
        throw error;
    }
}
