/** @type {import('next').NextConfig} */
function normalizeApiBase(url) {
  const trimmed = url.replace(/\/$/, "");
  if (trimmed.endsWith("/api/v1")) return trimmed;
  return `${trimmed}/api/v1`;
}

const apiProxyBase = normalizeApiBase(
  process.env.API_PROXY_TARGET ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://nestino-backend-production.up.railway.app/api/v1",
);

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
