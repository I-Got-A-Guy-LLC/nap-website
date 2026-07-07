/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/cities/manchester", destination: "/tn/manchester", permanent: true },
      { source: "/cities/murfreesboro", destination: "/tn/murfreesboro", permanent: true },
      { source: "/cities/nolensville", destination: "/tn/nolensville", permanent: true },
      { source: "/cities/smyrna", destination: "/tn/smyrna", permanent: true },
      { source: "/business-listing", destination: "/directory", permanent: true },
      { source: "/membership-levels", destination: "/join", permanent: true },
      { source: "/add-listing", destination: "/directory", permanent: true },
      { source: "/about/about-murfreesboro-networking", destination: "/tn/murfreesboro", permanent: true },
    ];
  },
};

export default nextConfig;
