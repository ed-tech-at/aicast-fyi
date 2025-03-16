// src/routes/episode/[episodeUrl]/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    return {
        episodeUrl: params.episodeUrl,
        date: new Date().toISOString()
    };
};
