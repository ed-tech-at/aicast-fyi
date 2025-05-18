import { json } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export async function POST({ request, cookies }) {
    

    try {
      const { formData, action } = await request.json();

      
      if (action === 'access') {
        const track = await prisma.track.findFirst({
          where: { id: formData.id },
          include: {
            segments: {
              orderBy: {
                position: 'asc',
              },
            },
          },
        });
      
        let accessCodes: string[] = [];
        if (track?.accessCode) {
          accessCodes = track.accessCode.split('\n');
        }

        if (!track) {
          return json({
            status: 404,
            error: 'Track not found',
          });
        }

        if (accessCodes.length > 0 && !accessCodes.includes(formData.accessCode)) {
          return json({
            status: 403,
            error: 'Access code is incorrect, retry.',
          });
        }
        
        return json({
          segments: track?.segments || [],
        });
      }
      

    } catch (error) {
        console.error('Error resetting password:', error);
        return json({ success: false, error: 'Ein Fehler ist aufgetreten.' }, { status: 500 });
    }
}
