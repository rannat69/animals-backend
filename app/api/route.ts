import fs from "node:fs/promises";
import path from "node:path";

const ipPath = path.join(process.cwd(), "data", "ip.json");
const logsPath = path.join(process.cwd(), "data", "logs.json");

async function readJsonOrDefault<T>(
  filePath: string,
  defaultValue: T,
): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export async function GET() {
  const [ip, logs] = await Promise.all([
    readJsonOrDefault(ipPath, {}),
    readJsonOrDefault(logsPath, []),
  ]);

  return Response.json(
    {
      ip,
      logs,
    },
    { status: 200 },
  );
}
