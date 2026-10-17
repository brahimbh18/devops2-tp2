import { NextResponse } from "next/server";

type CreateArticleBody = {
  title?: unknown;
  summary?: unknown;
};

function isCreateArticleBody(value: unknown): value is CreateArticleBody {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const apiToken = process.env.STRAPI_API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: "STRAPI_API_TOKEN n’est pas configuré sur le serveur." },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Le corps de la requête doit être un JSON valide." }, { status: 400 });
  }

  if (!isCreateArticleBody(body) || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Le champ title est obligatoire." }, { status: 400 });
  }

  if (body.summary !== undefined && body.summary !== null && typeof body.summary !== "string") {
    return NextResponse.json({ error: "Le champ summary doit être une chaîne de caractères." }, { status: 400 });
  }

  const baseUrl = process.env.STRAPI_URL ?? "http://localhost:1337";
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          title: body.title.trim(),
          summary: typeof body.summary === "string" ? body.summary.trim() || null : null,
        },
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Strapi est momentanément inaccessible." }, { status: 502 });
  }

  const responseBody = await response.text();
  let data: unknown;
  try {
    data = responseBody ? JSON.parse(responseBody) : null;
  } catch {
    data = { error: "Strapi a renvoyé une réponse invalide." };
  }

  return NextResponse.json(data, { status: response.status });
}
