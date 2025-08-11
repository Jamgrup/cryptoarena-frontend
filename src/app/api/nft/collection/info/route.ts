import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';

// Updated for FIXED Card Collection: EQDf6HH4A3x5N40KtE73FIfoeRnf5owyhzUfQhhBIrK3hl1G

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/nft/collection/info`, {
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
    console.error('NFT collection info proxy error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch collection info from backend',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}