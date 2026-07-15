import fs from "node:fs/promises";
import path from "node:path";

const storePath = path.join(process.cwd(), "data", "ip-store.json");

type IpStore = {
  ips: Record<string, number>;
};

function isLikelyIPv4(ip: string) {
  // Basic sanity check for IPv4. (If you also want IPv6, tell me.)
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d+$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const ip = body?.ip;

    if (typeof ip !== "string" || !ip.trim()) {
      return Response.json({ ok: false, error: "Missing 'ip' in JSON body." }, { status: 400 });
    }

    const ipTrimmed = ip.trim();

    // Basic check (IPv4). Adjust if you want IPv6 support.
    if (!isLikelyIPv4(ipTrimmed)) {
      return Response.json({ ok: false, error: "Invalid IPv4 address format." }, { status: 400 });
    }

    let store: IpStore;

    // Load (or initialize) store
    try {
      const raw = await fs.readFile(storePath, "utf8");
      store = JSON.parse(raw) as IpStore;
      if (!store?.ips) store.ips = {};
    } catch (err: any) {
      // File missing or unreadable -> initialize
      store = { ips: {} };
    }

    // Increment
    const current = store.ips[ipTrimmed] ?? 0;
    store.ips[ipTrimmed] = current + 1;

    // Write back
    await fs.mkdir(path.dirname(storePath), { recursive: true });
    await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");

    return Response.json({
      ok: true,
      ip: ipTrimmed,
      value: store.ips[ipTrimmed],
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}