import { NextRequest, NextResponse } from "next/server";
import { SERVER_API_BASE } from "@/lib/api-base";

/** Gemini YMYL audit can take 30–120s; Vercel Pro required for maxDuration > 10. */
export const maxDuration = 120;

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } },
) {
  const auth = req.headers.get("authorization");
  const body = await req.text();

  let res: Response;
  try {
    res = await fetch(`${SERVER_API_BASE}/pages/${params.pageId}/audit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: body || "{}",
    });
  } catch {
    return NextResponse.json(
      { message: "Cannot reach API server" },
      { status: 502 },
    );
  }

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
