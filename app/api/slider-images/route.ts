import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

export async function GET() {
  try {
    const cardsDir = path.join(process.cwd(), 'public', 'images', 'shared', 'cards');
    const files = fs.readdirSync(cardsDir);

    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext) && !file.startsWith('.');
      })
      .sort()
      .map(file => `https://mfl-leagues.com/images/shared/cards/${file}`);

    return NextResponse.json(images, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('Slider Images API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
