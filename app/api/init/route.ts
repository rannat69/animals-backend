import { init } from "next/dist/compiled/webpack/webpack";

let hasRun = false;

import fs from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const ipFile = path.join(process.cwd(), "data", "ip.json");
  const logFile = path.join(process.cwd(), "data", "logs.json");

  console.log("hasrun ?", hasRun);

  if (!hasRun) {
    hasRun = true; // Ensure it only runs once

    setInterval(async () => {
      console.log("Running scheduled file copy...");

      try {
        // Get current date in yyyy.mm.dd format
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const dateStr = `${yyyy}.${mm}.${dd}`;

        // Helper to insert date before the file extension (e.g., ip-2026.11.16.json)
        const getTimestampedPath = (filePath: string) => {
          const parsed = path.parse(filePath);
          return path.join(
            parsed.dir,
            `${parsed.name}-${dateStr}${parsed.ext}`,
          );
        };

        const targetIpFile = getTimestampedPath(ipFile);
        const targetLogFile = getTimestampedPath(logFile);

        // Copy the files
        await fs.copyFile(ipFile, targetIpFile);
        await fs.copyFile(logFile, targetLogFile);

        console.log(`Successfully backed up files for ${dateStr}`);
      } catch (error) {
        console.error("Failed to copy files during interval:", error);
      }
    }, 24*3600*1000);
  }

  return Response.json(
    {
      initMessage: "Init running",
    },
    { status: 200 },
  );
}
