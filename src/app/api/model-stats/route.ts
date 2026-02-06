import { getModelStats } from '@/ai/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stats = getModelStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching model stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
