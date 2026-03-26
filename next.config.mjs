/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/cities/manchester", destination: "/tn/manchester", permanent: true },
      { source: "/cities/murfreesboro", destination: "/tn/murfreesboro", permanent: true },
      { source: "/cities/nolensville", destination: "/tn/nolensville", permanent: true },
      { source: "/cities/smyrna", destination: "/tn/smyrna", permanent: true },
    ];
  },
};

export default nextConfig;
