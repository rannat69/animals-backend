import fs from "node:fs/promises";
import path from "node:path";

const storePath = path.join(process.cwd(), "data", "logs.json");

const ALLOWED_ORIGINS = [
  "https://animals-backend.vercel.app",
  // add your frontend origin(s) here, e.g.:
  // "http://localhost:3000",
  // "http://localhost:5173",
];

function withCorsHeaders(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*"); 
  // If you want stricter control, replace "*" with the incoming origin and validate it.

  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Useful if you want cookies/auth later
  // response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export async function OPTIONS() {
  return withCorsHeaders(new Response(null, { status: 204 }));
}

export async function POST() {
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const data = JSON.parse(raw) as { downloads?: number };

    data.downloads = (data.downloads ?? 0) + 1;

    await fs.writeFile(storePath, JSON.stringify(data, null, 2), "utf8");

    return withCorsHeaders(
      Response.json({
        ok: true,
        downloads: data.downloads,
      })
    );
  } catch (err) {
    return withCorsHeaders(
      Response.json({ ok: false, error: "Server error" }, { status: 500 })
    );
  }
}