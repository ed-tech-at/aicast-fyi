import { PrismaClient } from '@prisma/client';
import type { PageServerLoad, Actions } from './$types';
const prisma = new PrismaClient();

import { requireLogin } from '$lib/server/jwt';


export const load: PageServerLoad = async ({ params, cookies }) => {
    const user = requireLogin(cookies);
    
    const apiKeys = await prisma.apiKey.findMany({
        where: {
            userId: user.id
        },
        include: {
            voices: true
        }
    });

    const tracks = await prisma.track.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            URL: 'asc'
        },
       
    });


    apiKeys.forEach((key) => {
        key.key = key.key.substring(0, 15) + '***';
    });

    return {
      user,
      tracks,
      apiKeys
    };
    
}