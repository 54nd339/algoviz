import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-6">
      <p className="mb-2 font-mono text-xs tracking-[0.3em] text-accent-green uppercase">
        Error 404
      </p>
      <h1 className="mb-4 font-mono text-6xl font-bold text-text-primary">
        Not Found
      </h1>
      <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg border border-accent-green/20 bg-accent-green/5 px-5 py-2.5 font-mono text-xs text-accent-green transition-all hover:border-accent-green/40 hover:bg-accent-green/10"
      >
        <span className="text-accent-green">$</span> cd /home
      </Link>
    </div>
  );
}
