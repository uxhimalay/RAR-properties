import type { NextConfig } from "next";

/**
 * Photos hosted elsewhere (a developer's CDN, a listing portal) can be pasted into the admin. They
 * are rendered straight from their own host rather than through Next's image optimiser: leaving the
 * optimiser open to arbitrary hostnames would turn it into a public image proxy for the whole
 * internet. To optimise a particular host instead, add it here and drop `unoptimized` for it.
 */
const IMAGE_HOSTS = (process.env.NEXT_IMAGE_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean);

/** Sent with every response. A page of ours is never framed, never sniffed, and leaks no paths. */
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

const nextConfig: NextConfig = {
  // Hide the Next.js dev-tools badge so dev screenshots match the original page
  devIndicators: false,
  images: {
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // The admin and the content API are never for search engines or caches.
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
