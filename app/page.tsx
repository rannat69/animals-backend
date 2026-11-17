"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const init = async () => {
      try {
        await fetch("/api/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        // Redirect only after the fetch finishes (success or failure)
        window.location.assign("https://5j7j5.zappar-us.io/yttarchive/");
      }
    };

    init();
  }, []);

  return <></>;
}
