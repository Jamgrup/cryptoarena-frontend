import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';

export async function GET(
  request: NextRequest,
  { params }: { params: { index: string } }
) {
  try {
    const { index } = params;

    if (!index || isNaN(Number(index))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid card index is required'
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/nft/card/${index}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('NFT card proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch card info from backend',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}