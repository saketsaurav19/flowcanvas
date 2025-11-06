
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const files = fs.readdirSync(uploadsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    return NextResponse.json(jsonFiles);
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, data } = await request.json();
    const filePath = path.join(uploadsDir, `${name}.json`);


    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
