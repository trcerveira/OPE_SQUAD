import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const count = req.nextUrl.searchParams.get("count") || "12";

  if (!query) {
    return NextResponse.json({ error: "Parâmetro 'query' obrigatório" }, { status: 400 });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY não configurado no .env.local" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=portrait`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Unsplash API] erro:", res.status, body);
      return NextResponse.json(
        { error: `Unsplash devolveu erro ${res.status}. Verifica se a Access Key é válida.` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const photos = (data.results ?? []).map((p: { id: string; urls: { thumb: string; small: string; regular: string }; alt_description: string; user: { name: string } }) => ({
      id: p.id,
      thumb: p.urls.thumb,
      small: p.urls.small,
      regular: p.urls.regular,
      alt: p.alt_description || query,
      author: p.user.name,
    }));

    return NextResponse.json({ photos });
  } catch (err: unknown) {
    console.error("[Unsplash API] excepção:", err);
    return NextResponse.json(
      { error: "Erro interno ao contactar o Unsplash." },
      { status: 500 }
    );
  }
}
