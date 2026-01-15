import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city") || "bangalore";
    const threshold = searchParams.get("threshold") || "0.5";
    const date = searchParams.get("date");

    let url = `${BACKEND_URL}/api/hotspots?city=${city}&threshold=${threshold}`;
    if (date) {
      url += `&date=${date}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching hotspots:", error);
    return NextResponse.json(
      { error: "Failed to fetch hotspots" },
      { status: 500 }
    );
  }
}
