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

  // take each key in ip.ips, then make sum of values
  const totalVisits = Object.values(ip.ips ?? {}).reduce(
    (acc, val) => acc + (val as number),
    0,
  );

  return Response.json(
    {
      ip,
      logs,
      totalVisits,
    },
    { status: 200 },
  );
}
