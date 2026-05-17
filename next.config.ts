import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  // Next.js injects inline scripts for hydration — unsafe-inline required without nonces.
  // React uses eval() in dev mode for call-stack reconstruction; never in production.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Cloudinary (images/video), Google OAuth avatars, Unsplash (seed data)
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://images.unsplash.com https://avatars.githubusercontent.com",
  // Geist fonts are self-hosted by next/font at build time
  "font-src 'self'",
  // Browser-side uploads go directly to Cloudinary
  "connect-src 'self' https://api.cloudinary.com",
  // Video playback from Cloudinary
  "media-src 'self' blob: https://res.cloudinary.com",
  // Prevent this page from being embedded in iframes (belt + suspenders with X-Frame-Options)
  "frame-ancestors 'none'",
  // Prevent base-tag injection
  "base-uri 'self'",
  // Server actions POST to same origin; block form hijacking to external sites
  "form-action 'self'",
]
  .join("; ");

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Cache static assets (JS, CSS, fonts, images) for 1 year
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Security headers for all routes
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
