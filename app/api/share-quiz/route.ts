import { NextResponse } from 'next/server';
import { createClient } from '@vercel/kv';

// Initialize the KV client
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export async function POST(request: Request) {
  console.log('POST request received');
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers));
  console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL);
  console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Set' : 'Not set');
  console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  try {
    const quiz = await request.json();
    console.log('Received quiz:', quiz);
    
    // Generate a unique ID for the shared quiz
    const shareId = Math.random().toString(36).substring(2, 8);
    
    // Store the quiz in Vercel KV with an expiration of 24 hours
    await kv.set(`quiz:${shareId}`, JSON.stringify(quiz), { ex: 86400 });
    
    // Return the share URL
    const shareLink = `${process.env.NEXT_PUBLIC_BASE_URL}/shared/${shareId}`;
    console.log('Generated shareLink:', shareLink);
    return NextResponse.json({ shareLink });
  } catch (error: unknown) {
    console.error('Error in POST:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to share quiz', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to share quiz', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const shareId = url.searchParams.get('id');

  if (!shareId) {
    return NextResponse.json({ error: 'No share ID provided' }, { status: 400 });
  }

  try {
    const quizData = await kv.get(`quiz:${shareId}`);
    
    if (!quizData) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ quiz: JSON.parse(quizData as string) });
  } catch (error) {
    console.error('Error retrieving shared quiz:', error);
    return NextResponse.json({ error: 'Failed to retrieve shared quiz' }, { status: 500 });
  }
}

// Add this to handle OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}