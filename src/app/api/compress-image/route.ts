import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Max dimension to resize large images (keeps aspect ratio)
const MAX_WIDTH = 800;
const MAX_HEIGHT = 1200;
const JPEG_QUALITY = 80; // percentage

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'file field missing' }, { status: 400 });
    }

    // Read file into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Use sharp to resize & recompress
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    let width = metadata.width || MAX_WIDTH;
    let height = metadata.height || MAX_HEIGHT;

    // Calculate new dimensions while keeping aspect ratio within MAX_WIDTH/HEIGHT
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
    }

    const outputBuffer = await image
      .resize(width, height)
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    return new NextResponse(outputBuffer.buffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
  } catch (err: any) {
    console.error('Compression error', err);
    return NextResponse.json({ error: 'compression failed' }, { status: 500 });
  }
}
