import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
    const { filename } = params;
    const filePath = path.resolve('data/audio', filename);

    console.log('accessing ', filePath);

    // Überprüfen, ob die Datei existiert
    if (!fs.existsSync(filePath)) {
        throw error(404, 'File not found');
    }

    return new Response(fs.createReadStream(filePath), {
        headers: {
            'Content-Type': 'audio/mpeg', // Falls MP3, passe den Typ für andere Formate an
            'Content-Disposition': `inline; filename="${filename}"`, // Optional
        }
    });
}
