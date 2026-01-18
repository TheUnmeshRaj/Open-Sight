import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city") || "bangalore";
    const timeWindow = searchParams.get("timeWindow") || "current";

    const response = await fetch(
      `${BACKEND_URL}/api/predictions?city=${city}&timeWindow=${timeWindow}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    console.log('Calling backend:', `${BACKEND_URL}/api/predict`, data);

    const response = await fetch(`${BACKEND_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log('Backend response status:', response.status);

    // Get response text to inspect it
    const responseText = await response.text();
    console.log('Backend response preview:', responseText.substring(0, 200));

    if (!response.ok) {
      // Try to parse as JSON first
      try {
        const errorData = JSON.parse(responseText);
        return NextResponse.json(errorData, { status: response.status });
      } catch (e) {
        // If it's not JSON, it's likely HTML error page
        return NextResponse.json(
          { error: `Backend error (${response.status}): ${response.statusText}. Is the Flask server running on ${BACKEND_URL}?` },
          { status: 503 }
        );
      }
    }

    // Parse successful response
    try {
      const result = JSON.parse(responseText);
      return NextResponse.json(result);
    } catch (e) {
      console.error('Failed to parse successful response as JSON:', e);
      return NextResponse.json(
        { error: "Invalid JSON response from backend" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in predict API:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Backend error: ${errorMsg}. Is Flask running on ${BACKEND_URL}?` },
      { status: 500 }
    );
  }
}
