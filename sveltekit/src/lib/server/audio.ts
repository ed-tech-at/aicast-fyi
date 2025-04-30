import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient(); // Initialize Prisma Client
const AUDIO_DIR = path.join(process.cwd(), 'data', 'audio'); // Directory for storing MP3s

// console.log("Current working directory:", process.cwd());

import { env } from '$env/dynamic/private';

import {newAudioUUID} from './utils';

// Ensure the directory exists
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
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
    segmentId: string
): Promise<{filename: string; cached: boolean}> {
    try {
        if (!text || !voiceId || !segmentId) {
            throw new Error('Text, voiceId, and segmentId are required');
        }

        // Check if an audio file already exists for the given text and voiceId
        const existingAudio = await prisma.audio.findFirst({
            where: {
                text: text,
                voice_id: voiceId
            }
        });

        if (existingAudio) {
            const existingAudioPath = path.join(AUDIO_DIR, existingAudio.folder, `${existingAudio.id}.mp3`);
            // console.log(`1. Returning existing audio file: ${existingAudioPath}`);
            if (fs.existsSync(existingAudioPath)) {
                console.log(`Returning existing audio file: ${existingAudioPath}`);
                return {filename: `${existingAudio.id}.mp3`, cached: true}; // Return the existing file
            }

        }

        // Generate and save new audio if not found
        const newFile = await generateAndSaveAudio(text, voiceId, segmentId);



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
export async function generateAndSaveAudio(
    text: string,
    voiceId: string,
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

        const newAudio = await prisma.audio.create({
            data: {
                segmentCreatedId: segmentId,
                voice_id: voiceId,
                folder: yearMonth,
                text: text,
                // previousText: previous_text,
                // nextText: next_text,
                // language_code: language_code,
                id: newAudioId
            }
        });

        



        const audioPath = path.join(AUDIO_DIR, yearMonth, `${newAudio.id}.mp3`); // Use UUID as filename

        console.log(`Generating speech for: "${text}". Voice: ${voiceId}`);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                voice_id: voiceId,
                // model_id: "eleven_monolingual_v1",
                language_code: "de",
                model_id: "eleven_v2_5_flash",
                output_format: "mp3"
            })
        });

        if (!response.ok) {
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

        console.log(`Saved new audio file: ${audioPath}`);

        return `${yearMonth}/${newAudio.id}.mp3`; // Return the saved file path

    } catch (error) {
        console.error("Error generating audio:", error);
        throw error;
    }
}
