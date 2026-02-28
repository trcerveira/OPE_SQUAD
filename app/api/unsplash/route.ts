import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const count = req.nextUrl.searchParams.get("count") || "10";

  if (!query) {
    return NextResponse.json({ error: "query obrigatório" }, { status: 400 });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY não configurado" },
      { status: 500 }
    );
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Erro na API do Unsplash" }, { status: 500 });
  }

  const data = await res.json();
  const photos = data.results.map((p: any) => ({
    id: p.id,
    thumb: p.urls.thumb,
    small: p.urls.small,
    regular: p.urls.regular,
    alt: p.alt_description || query,
    author: p.user.name,
  }));

  return NextResponse.json({ photos });
}
