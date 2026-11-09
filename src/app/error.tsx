"use client";

import { useEffect } from "react";
import { MessageCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 text-white">
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 text-center">
        <header className="flex max-w-sm flex-col items-center gap-2">
          <h1 className="mask-b-from-20% mask-b-to-80% text-8xl font-extrabold sm:text-9xl">
            500
          </h1>
          <p className="-mt-5 text-foreground/80">Something went wrong.</p>
          <p className="max-w-md text-sm text-zinc-400">
            An unexpected error occurred while processing your request. Please
            try again, and contact support if the problem persists.
          </p>
        </header>

        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-zinc-200"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try Again
            </button>
            <a
              href="https://wa.me/6288706392829"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-white/15 bg-transparent px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/10"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Contact Support
            </a>
          </div>
        </div>

        {error.digest && (
          <p className="font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
