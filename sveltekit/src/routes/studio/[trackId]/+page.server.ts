import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
// import { updated } from '$app/state';



const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {
  const trackId = params.trackId;

  const track = await prisma.track.findUnique({
    where: { id: trackId },
  });

  const segments = await prisma.segment.findMany({
    where: { f_trackId: trackId },
    orderBy: { position: 'asc' }
  });

  return {
    trackId,
    track,
    segments,
    date: new Date().toISOString(),
  };
};

// export const actions: Actions = {
//   update: async ({ request, params }) => {
//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const desc = formData.get('desc') as string;
//     const trackId = params.trackId;

//     if (!title || !desc) {
//       return { status: 400, body: { error: 'Title and Description are required' } };
//     }

//     const updatedTrack = await prisma.track.update({
//       where: { id: trackId },
//       data: {
//         title,
//         desc,
//         updatedDate: new Date(),
//       },
//     });

//     return { status: 200, body: { id: updatedTrack.id } };
//   }
// };