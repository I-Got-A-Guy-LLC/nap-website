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

      // Directory slugs that were generated from business names with a trailing
      // space, leaving a dangling hyphen in the URL. The names have been trimmed
      // and the slugs corrected; these keep the old links working.
      { source: "/directory/TN/urtechnow-", destination: "/directory/TN/urtechnow", permanent: true },
      { source: "/directory/TN/floor-coverings-international-", destination: "/directory/TN/floor-coverings-international", permanent: true },
      { source: "/directory/TN/ts-design-photography-", destination: "/directory/TN/ts-design-photography", permanent: true },
      { source: "/directory/TN/615-insurance-agency-", destination: "/directory/TN/615-insurance-agency", permanent: true },
      { source: "/directory/TN/benchmark-realty-", destination: "/directory/TN/benchmark-realty", permanent: true },
      { source: "/directory/TN/juiceplus-", destination: "/directory/TN/juiceplus", permanent: true },
    ];
  },
};

export default nextConfig;
