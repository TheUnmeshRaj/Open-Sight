"use client";
import { useEffect } from "react";

export default function Pred() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://tenor.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
    <div style={{ display: "flex", justifyContent: "center" }}>

      <div
        className="tenor-gif-embed"
        data-postid="21746558"
        data-share-method="host"
        data-aspect-ratio="1.77778"
        data-width="80%"
      >
        <a href="https://tenor.com/view/why-are-you-gae-meme-gae-gif-21746558">
        </a>
      </div>
      </div>

    </>
  );
}
