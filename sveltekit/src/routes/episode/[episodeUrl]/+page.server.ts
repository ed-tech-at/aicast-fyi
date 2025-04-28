// src/routes/track/[trackUrl]/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    return {
        trackUrl: params.trackUrl,
        date: new Date().toISOString()
    };
};
