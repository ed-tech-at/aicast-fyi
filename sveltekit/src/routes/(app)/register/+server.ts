import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import { register } from '$lib/server/pw.js';



export async function POST({ request, params }) {
  try {
      let { formData, action } = await request.json();

      if (action == "register") {

        return register(formData.email, formData.password);

      }
  } catch (error) {
      return json({ success: false, error: error.message }, { status: 500 });
  }
}
