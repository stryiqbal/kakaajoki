"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

export default function HistoryNavigationLoader() {
  const pathname = usePathname();
  const loader = useTopLoader();

  useEffect(() => {
    const startOnHistoryNavigation = () => loader.start();
    window.addEventListener("popstate", startOnHistoryNavigation);

    return () => {
      window.removeEventListener("popstate", startOnHistoryNavigation);
    };
  }, [loader]);

  useEffect(() => {
    loader.done();
  }, [loader, pathname]);

  return null;
}