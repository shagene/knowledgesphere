import { NextResponse } from 'next/server';
import { createClient } from '@vercel/kv';

// Initialize the KV client
const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Helper function to get the base URL
function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export async function POST(request: Request) {
  console.log('POST request received');
  
  try {
    const quiz = await request.json();
    console.log('Received quiz:', quiz);
    
    // Generate a unique ID for the shared quiz
    const shareId = Math.random().toString(36).substring(2, 8);
    
    // Ensure the quiz is stringified before storing
    await kv.set(`quiz:${shareId}`, JSON.stringify(quiz), { ex: 86400 });
    
    console.log('Generated shareId:', shareId);
    return NextResponse.json({ shareId });
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

    // Check if quizData is already an object
    const quiz = typeof quizData === 'object' ? quizData : JSON.parse(quizData as string);

    return NextResponse.json({ quiz });
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