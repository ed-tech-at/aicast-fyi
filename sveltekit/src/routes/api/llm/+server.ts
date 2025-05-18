import { requireLogin } from '$lib/server/jwt.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { json } from '@sveltejs/kit';


export async function POST({ request, cookies }) {
  try {
    const { formData, action } = await request.json();

    requireLogin(cookies)
    if (action == 'loadStoredLLMResponseForStudio') {
      const { segmentId, studentAnswer, systemPrompt } = formData;

      const llmResponse = await prisma.lLMGeneratedText.findFirst({
        where: { segmentId, studentAnswer, systemPrompt },
        orderBy: { createdDate: 'desc' },
      });
      if (!llmResponse) {
        return json({ success: false, error: 'No old LLM response found.' }, { status: 404 });
      }
      return json({ success: true, text: llmResponse });
    }
  } catch (error) {
      console.error('Error resetting password:', error);
      return json({ success: false, error: 'Ein Fehler ist aufgetreten.' }, { status: 500 });
  }

}