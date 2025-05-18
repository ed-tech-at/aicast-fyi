import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
    const { folder, filename } = params;
    const filePath = path.resolve('data/audio', folder, filename);

    // console.log('accessing ', filePath);

    // Überprüfen, ob die Datei existiert
    if (!fs.existsSync(filePath)) {
        throw error(404, 'File not found');
    }

    return new Response(fs.createReadStream(filePath), {
        headers: {
            'Content-Type': 'audio/mpeg', // Falls MP3, passe den Typ für andere Formate an
            'Content-Disposition': `inline; filename="${filename}"`, // Optional
            'Cache-Control': 'public, max-age=2592000' // Cache for 30 days (30 * 24 * 60 * 60 seconds)
        }
    });
}
