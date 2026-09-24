"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/** The passcode gate for /admin. */
export default function AdminLogin() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: code }) });
    setPending(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not sign in");
      return;
    }
    router.replace("/admin");
  };
  return (
    <main className="flex min-h-svh items-center justify-center bg-[#f6f4f0] px-5 text-[var(--color-ink)]">
      <form onSubmit={submit} className="flex w-full max-w-[380px] flex-col gap-6 border border-dashed bg-white p-8" style={{ borderColor: "rgba(79,71,66,0.25)" }}>
        <div className="flex flex-col gap-2">
          <p className="font-inter text-[11px] font-medium uppercase tracking-[0.44px]" style={{ color: "var(--color-gold-ink)" }}>ArcSphere admin</p>
          <h1 className="font-display text-[28px] font-normal leading-[1.1] tracking-[-0.02em]">Sign in</h1>
          <p className="font-inter text-[13px] font-medium leading-[18px] text-[var(--color-ink-2)]">Enter the passcode to edit the site&rsquo;s content.</p>
        </div>
        <label className="flex flex-col gap-2">
          <span className="font-inter text-[11px] font-medium uppercase tracking-[0.44px] text-[var(--color-ink-2)]">Passcode</span>
          <input type="password" autoFocus autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} className="h-11 border border-dashed bg-transparent px-3 font-inter text-[15px] outline-none focus:border-solid focus:border-[var(--color-gold-ink)]" style={{ borderColor: "rgba(79,71,66,0.3)" }} />
        </label>
        {error && <p role="alert" className="font-inter text-[13px] font-medium text-[#a2432d]">{error}</p>}
        <button type="submit" disabled={pending || !code} className="flex h-11 cursor-pointer items-center justify-center bg-[var(--color-gold)] font-inter text-[11px] font-medium uppercase tracking-[0.44px] text-black transition-colors hover:bg-[var(--color-gold-light)] disabled:cursor-default disabled:opacity-60">
          {pending ? "Signing in…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
