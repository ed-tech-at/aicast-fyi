import fs from 'fs';
import path from 'path';

export async function GET({ params }) {
    const filePath = path.resolve('static/data/audio/', 'a04d6926-59c3-4a6e-a12f-437bb5b71553.mp3');

    if (fs.existsSync(filePath)) {
        return new Response(JSON.stringify({ exists: true, path: filePath }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ exists: false, path: filePath }), { status: 404 });
    }
}
