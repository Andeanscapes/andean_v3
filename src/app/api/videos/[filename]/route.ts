import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Security: only allow specific filenames
    const allowedFiles = ['emerald-mining.mp4'];
    if (!allowedFiles.includes(filename)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const filepath = join(process.cwd(), 'public', 'videos', filename);
    const file = await readFile(filepath);

    const response = new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': file.length.toString(),
        'Cache-Control': 'public, max-age=86400, immutable',
        'Accept-Ranges': 'bytes',
      },
    });

    return response;
  } catch (error) {
    console.error('Video serving error:', error);
    return NextResponse.json(
      { error: 'Failed to load video' },
      { status: 500 }
    );
  }
}
