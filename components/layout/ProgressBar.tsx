"use client";

import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Escuchar un evento custom "video-progress" emitido por el componente Hero
    const handleProgress = (e: CustomEvent<{ progress: number }>) => {
      setWidth(e.detail.progress);
    };

    window.addEventListener("video-progress" as any, handleProgress);

    return () => {
      window.removeEventListener("video-progress" as any, handleProgress);
    };
  }, []);

  return <div className="progress-bar" id="progressBar" style={{ width: `${width}%` }}></div>;
}
