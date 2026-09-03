import type { NextConfig } from "next";

// Server-side only — never sent to the browser. Used only when
// NEXT_PUBLIC_API_URL is set to the relative path "/api": Next's own server
// then forwards those requests to the backend on this machine, so a single
// public ngrok URL (the frontend's) is enough for remote quote submissions —
// no second public hostname for the backend is required. Local development
// with NEXT_PUBLIC_API_URL=http://localhost:8000 never hits this rewrite.
// See "Sharing your local instance (ngrok)" in README.md.
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_INTERNAL_URL}/:path*` }];
  },
};

export default nextConfig;
