// app/api/image-proxy/route.ts

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get("cid");

  if (!cid) {
    return new Response("CID missing", { status: 400 });
  }

  const pinataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

  try {
    const response = await fetch(pinataUrl);

    if (!response.ok) {
      return new Response("Failed to fetch image", { status: 500 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // optional caching
      },
    });
  } catch (err) {
    return new Response("Error fetching image", { status: 500 });
  }
}
