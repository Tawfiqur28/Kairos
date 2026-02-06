import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Stats functionality has been removed. Returning empty object.
    return NextResponse.json({});
  } catch (error) {
    console.error('Error in model-stats endpoint:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
