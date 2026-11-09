import Link from "next/link";

export default function NotFound() {
  return (
    <main data-hide-floating-cs className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 text-white">
      <div className="flex w-full flex-col items-center justify-center gap-6 p-6 text-center">
        <header className="flex max-w-sm flex-col items-center gap-2">
          <h1 className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
            404
          </h1>
          <p className="-mt-8 text-nowrap text-foreground/80">
            The page you&apos;re looking for might have been <br />
            moved or doesn&apos;t exist.
          </p>
        </header>
        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <div className="flex gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-black shadow-sm transition-colors hover:bg-zinc-200"
            >
              Go Home
            </Link>
            <Link
              href="/#layanan"
              className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 bg-transparent px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-white/10"
            >
              Explore
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}