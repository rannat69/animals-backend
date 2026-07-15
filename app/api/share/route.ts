import fs from "node:fs/promises";
import path from "node:path";

const storePath = path.join(process.cwd(), "data", "logs.json");

export async function POST() {
  // NOTE: For basic usage this works.
  // If you expect concurrent requests, add a locking strategy (explained below).
  const raw = await fs.readFile(storePath, "utf8");
  const data = JSON.parse(raw) as { shares: number };

  data.shares = (data.shares ?? 0) + 1;

  await fs.writeFile(storePath, JSON.stringify(data, null, 2), "utf8");

  return Response.json({
    ok: true,
    shares: data.shares,
  });
}