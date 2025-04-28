import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

import { env } from '$env/dynamic/private'; // Ensure you have the correct path to your environment variables

const prisma = new PrismaClient(); // Initialize Prisma Client

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY, // Ensure your API key is stored in .env
});

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
    developerPrompt: string,
    userInput: string,
    segmentId: string
): Promise<{ response: string }> {
    try {
        console.log('developerPrompt', developerPrompt);
        console.log('userInput', userInput);
        console.log('segmentId', segmentId);
        if (!developerPrompt || !userInput || !segmentId) {
            throw new Error('Developer prompt, user input, and segmentId are required');
        }

        // Check if an AI response already exists for the given input
        // const existingAIResponse = await prisma.aiResponse.findFirst({
        //     where: {
        //         user_input: userInput,
        //         developer_prompt: developerPrompt,
        //     }
        // });

        // if (existingAIResponse) {
        //     console.log(`Returning cached AI response: ${existingAIResponse.response}`);
        //     return { response: existingAIResponse.response, cached: true };
        // }

        // Generate AI response using OpenAI's GPT-4o-mini
        console.log(`Generating AI response for input: "${userInput}"`);
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Use GPT-4o-mini or a different OpenAI model if preferred
            messages: [
                { role: "developer", content: developerPrompt },
                { role: "user", content: userInput }
            ],
            temperature: 0.7, // Adjust for creativity (0.0 = more predictable, 1.0 = highly creative)
        });

        const responseText = aiResponse.choices[0]?.message?.content?.trim() || "No response generated.";

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
