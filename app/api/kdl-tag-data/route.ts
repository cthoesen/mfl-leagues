import { NextResponse } from 'next/server';
// Import the data directly
import week12Data from './week12-data.json';

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Return the locked Week 12 data directly
    return NextResponse.json(week12Data);
    
  } catch (error: any) {
    console.error("KDL Tag Data Error:", error);
    return NextResponse.json({ error: "Failed to load local data" }, { status: 500 });
  }
}