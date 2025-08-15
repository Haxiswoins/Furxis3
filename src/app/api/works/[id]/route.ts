
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const works = await readData();
    const work = works.find(w => w.id === params.id);

    if (!work) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }
    return NextResponse.json(work);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const putSchema = z.object({
  workName: z.string(),
  clientName: z.string(),
  clientCity: z.string(),
  completionDate: z.string().datetime(),
  imageUrls: z.array(z.string().url()).min(1),
  description: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    let works = await readData();
    const index = works.findIndex(w => w.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }

    works[index] = { ...works[index], ...validation.data };
    await writeData(works);

    return NextResponse.json(works[index]);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let works = await readData();
    const originalLength = works.length;
    const filteredWorks = works.filter(w => w.id !== params.id);

    if (originalLength === filteredWorks.length) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }

    await writeData(filteredWorks);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
