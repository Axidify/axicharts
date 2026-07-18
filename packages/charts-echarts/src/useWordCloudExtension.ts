"use client";

import { useEffect, useState } from "react";

let wordCloudReady = false;
let wordCloudLoading: Promise<void> | null = null;

function loadWordCloudExtension(): Promise<void> {
  if (wordCloudReady) {
    return Promise.resolve();
  }
  if (!wordCloudLoading) {
    wordCloudLoading = import("echarts-wordcloud").then(() => {
      wordCloudReady = true;
    });
  }
  return wordCloudLoading;
}

export function useWordCloudExtension(): boolean {
  const [ready, setReady] = useState(wordCloudReady);

  useEffect(() => {
    if (wordCloudReady) {
      setReady(true);
      return;
    }

    let cancelled = false;
    void loadWordCloudExtension().then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
