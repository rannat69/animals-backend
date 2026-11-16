"use client";

import { useEffect } from "react";

export default function Home() {


  
  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/init", {
        method: "POST", // Usually checkout sessions require a POST request
        headers: { "Content-Type": "application/json" },
      });
    };

    init();

    window.location.assign("https://5j7j5.zappar-us.io/yttarchive/");
  }, []);

  return <></>;
}
