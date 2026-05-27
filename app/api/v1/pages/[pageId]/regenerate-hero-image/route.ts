import { NextRequest, NextResponse } from "next/server";
import { SERVER_API_BASE } from "@/lib/api-base";

/** Imagen hero regeneration is synchronous and can take 30–90s. */
export const maxDuration = 90;

export async function POST(
  req: NextRequest,
  { params }: { params: { pageId: string } },
) {
  const auth = req.headers.get("authorization");
  const search = req.nextUrl.search;

  let res: Response;
  try {
    res = await fetch(
      `${SERVER_API_BASE}/pages/${params.pageId}/regenerate-hero-image${search}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
        },
        body: "{}",
      },
    );
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
