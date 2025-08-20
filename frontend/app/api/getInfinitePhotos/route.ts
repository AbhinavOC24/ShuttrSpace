import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const skip = parseInt(searchParams.get("skip") || "0", 10);
  const take = parseInt(searchParams.get("take") || "20", 10);

  const photos = Array.from({ length: take }).map((_, i) => {
    const id = skip + i;
    return {
      id,
      title: `Photo ${id}`,
      thumbnailUrl: `https://picsum.photos/seed/${id}/400/300`,
      imageUrl: `https://picsum.photos/seed/${id}/800/600`,
      createdAt: new Date().toISOString(),
    };
  });

  return NextResponse.json(photos);
}
