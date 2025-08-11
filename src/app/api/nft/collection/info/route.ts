import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cryptoarena-backend.onrender.com';

// Updated for FINAL Card Collection: EQAzl-kOACDlC3Zp5yxGicc7v585vos7FtQn8XDe20MHSO_8 (ALL FIXES)

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