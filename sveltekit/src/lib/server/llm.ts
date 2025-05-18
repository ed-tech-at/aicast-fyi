import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

import { env } from '$env/dynamic/private'; // Ensure you have the correct path to your environment variables

const prisma = new PrismaClient(); // Initialize Prisma Client

// const openai = new OpenAI({
//     apiKey: env.OPENAI_API_KEY, // Ensure your API key is stored in .env
// });

/**
 * Generates or retrieves an AI-generated response.
 *
 * - If the response already exists in the database, return the cached response.
 * - If not, use OpenAI's GPT-4o-mini to generate a new response, store it, and return it.
 *
 * @param developerPrompt - The system prompt that guides the AI.
 * @param userInput - The actual user question or input.
 * @param segmentId - The ID of the related Segment.
 * @returns {Promise<{response: string, cached: boolean}>} - The AI-generated response and cache status.
 */
export async function generateLLMResponse(
    systemPrompt: string,
    userInput: string,
    segmentId: string
): Promise<{ response: string }> {
    try {


        console.log('systemPrompt', systemPrompt);
        // console.log('userInput', userInput);
        // console.log('segmentId', segmentId);
        if (!systemPrompt || !userInput || !segmentId) {
            throw new Error('system prompt, user input, and segmentId are required');
        }


        const segment = await prisma.segment.findFirst({
            where: { id: segmentId },
            include: {
                track: {  
                    include: {
                        apiKeyLLM: true,
                    }
                }
            }
        });
        if (!segment) {
            throw new Error('Segment not found');
        }
        if (!segment.track.apiKeyLLM || !segment.track.apiKeyLLM.key) {
            throw new Error('No API key for LLM found');
        }
        

        const openai = new OpenAI({
            apiKey: segment.track.apiKeyLLM.key,
        });


        // Check if an AI response already exists for the given input
        // const existingAIResponse = await prisma.aiResponse.findFirst({
        //     where: {
        //         user_input: userInput,
        //         developer_prompt: systemPrompt,
        //     }
        // });

        // if (existingAIResponse) {
        //     console.log(`Returning cached AI response: ${existingAIResponse.response}`);
        //     return { response: existingAIResponse.response, cached: true };
        // }

        // Generate AI response using OpenAI's GPT-4o-mini
        // console.log(`Generating AI response for input: "${userInput}"`);
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Use GPT-4o-mini or a different OpenAI model if preferred
            messages: [
                { role: "developer", content: "You are a helpful educational podcast texter. Only respond planetext, no markdown, based on the teacher system prompt and student user input." },
                { role: "system", content: systemPrompt },
                { role: "user", content: userInput }
            ],
            temperature: 0.7, // Adjust for creativity (0.0 = more predictable, 1.0 = highly creative)
        });

        const responseText = aiResponse.choices[0]?.message?.content?.trim() || "No response generated.";

        await prisma.lLMGeneratedText.create({
            data: {
                segmentId: segmentId,
                systemPrompt: systemPrompt,
                result: responseText,
                studentAnswer: userInput,
                createdDate: new Date()
            }
        });

        // Store the new AI response in the database
        // const newAIResponse = await prisma.aiResponse.create({
        //     data: {
        //         f_segmentId: segmentId,
        //         developer_prompt: developerPrompt,
        //         user_input: userInput,
        //         response: responseText,
        //     }
        // });

        // console.log(`Stored new AI response: ${newAIResponse.response}`);

        return { response: responseText };

    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}



/**
 * Generates or retrieves an AI-generated response.
 *
 * - If the response already exists in the database, return the cached response.
 * - If not, use OpenAI's GPT-4o-mini to generate a new response, store it, and return it.
 *
 * @param systemPrompt - The system prompt that guides the AI.
 * @param userInput - The actual user question or input.
 * @param segmentId - The ID of the related Segment.
 * @returns {Promise<{response: string, cached: boolean}>} - The AI-generated response and cache status.
 */
export async function checkOrGenerateLLMResponse(
    systemPrompt: string,
    userInput: string,
    segmentId: string
): Promise<{ response: string, cached?: boolean }> {
    try {
        const segment = await prisma.segment.findFirst({
            where: { id: segmentId },
            include: {
                track: {
                    include: {
                        apiKeyLLM: true,
                    }
                }
            }
        });

        if (!segment) {
            throw new Error('Segment not found');
        }

        const oldResponse = await prisma.lLMGeneratedText.findFirst({
            where: {
                segmentId: segmentId,
                studentAnswer: userInput,
                systemPrompt: systemPrompt,
            },
            orderBy: { createdDate: 'desc' },
        });

       if (oldResponse && oldResponse.result) {
        //    console.log(`Returning cached AI response: ${oldResponse.result}`);
           return { response: oldResponse.result, cached: true };
       }

       return generateLLMResponse(systemPrompt, userInput, segmentId);
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw error;
    }
}