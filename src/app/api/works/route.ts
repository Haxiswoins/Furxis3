
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { Work } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'works.json');

async function readData(): Promise<Work[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: Work[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = await readData();
    data.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/WORKS/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const postSchema = z.object({
  workName: z.string(),
  clientName: z.string(),
  clientCity: z.string(),
  completionDate: z.string().datetime(),
  imageUrls: z.array(z.string().url()).min(1),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const works = await readData();
    const newWork: Work = {
      id: `work_${Date.now()}`,
      ...validation.data,
    };
    works.push(newWork);
    await writeData(works);
    
    return NextResponse.json(newWork, { status: 201 });
  } catch (error) {
    console.error('[API/WORKS/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
