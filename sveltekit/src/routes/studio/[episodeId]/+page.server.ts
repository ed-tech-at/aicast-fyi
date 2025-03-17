import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
// import { updated } from '$app/state';



const prisma = new PrismaClient();

export const load: PageServerLoad = async ({ params }) => {
  const episodeId = params.episodeId;

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });

  const episodeElements = await prisma.episodeElement.findMany({
    where: { f_episodeId: episodeId },
    orderBy: { position: 'asc' }
  });

  return {
    episodeId,
    episode,
    episodeElements,
    date: new Date().toISOString(),
  };
};

// export const actions: Actions = {
//   update: async ({ request, params }) => {
//     const formData = await request.formData();
//     const title = formData.get('title') as string;
//     const desc = formData.get('desc') as string;
//     const episodeId = params.episodeId;

//     if (!title || !desc) {
//       return { status: 400, body: { error: 'Title and Description are required' } };
//     }

//     const updatedEpisode = await prisma.episode.update({
//       where: { id: episodeId },
//       data: {
//         title,
//         desc,
//         updatedDate: new Date(),
//       },
//     });

//     return { status: 200, body: { id: updatedEpisode.id } };
//   }
// };