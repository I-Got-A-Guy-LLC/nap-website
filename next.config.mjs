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

      // The giveaway page lives at the short path because it is printed under a
      // QR code at the booth. This catches the longer /events/ form if it gets
      // shared or typed.
      { source: "/events/depot-days", destination: "/depot-days", permanent: false },

      // Slug tidied after the duplicate Crimson Security record was removed.
      { source: "/directory/TN/faith-and-grace-flooring--9gtv", destination: "/directory/TN/faith-and-grace-flooring", permanent: true },
      { source: "/directory/TN/juiceplus-t9lo", destination: "/directory/TN/juiceplus", permanent: true },

      // Slugs regenerated after fixing two bugs: business names were stored
      // untrimmed, and a listing collided with itself on re-save and picked up a
      // random suffix. These keep every previously-shared URL working.
      { source: "/directory/TN/adult-teen-challenge-murfreesboro-", destination: "/directory/TN/adult-teen-challenge-murfreesboro", permanent: true },
      { source: "/directory/TN/home-town-appraisal-", destination: "/directory/TN/home-town-appraisal", permanent: true },
      { source: "/directory/TN/arash-law-qtbn", destination: "/directory/TN/arash-law", permanent: true },
      { source: "/directory/TN/premier-financial-alliance-", destination: "/directory/TN/premier-financial-alliance", permanent: true },
      { source: "/directory/TN/office-nameplates-vqke", destination: "/directory/TN/office-nameplates", permanent: true },
      { source: "/directory/TN/michael-busey-state-farm-eluq", destination: "/directory/TN/michael-busey-state-farm", permanent: true },
      { source: "/directory/TN/people-helping-people--3k2x", destination: "/directory/TN/people-helping-people", permanent: true },
      { source: "/directory/TN/custom-marble-creations-vqfk", destination: "/directory/TN/custom-marble-creations", permanent: true },
      { source: "/directory/TN/tradewind-digital--dtmv", destination: "/directory/TN/tradewind-digital", permanent: true },
      { source: "/directory/TN/i-hate-buying-insurance--ofqw", destination: "/directory/TN/i-hate-buying-insurance", permanent: true },
      { source: "/directory/TN/shady-tree-bookkeeping-", destination: "/directory/TN/shady-tree-bookkeeping", permanent: true },
      { source: "/directory/TN/ace-handyman-services-murfreesboro-kxmq", destination: "/directory/TN/ace-handyman-services-murfreesboro", permanent: true },
      { source: "/directory/TN/medicare-kandy-pmxt", destination: "/directory/TN/medicare-kandy", permanent: true },
      { source: "/directory/TN/corepath-nutrition-coaching-llc-f26d", destination: "/directory/TN/corepath-nutrition-coaching-llc", permanent: true },
      { source: "/directory/TN/structure-group-uuqm", destination: "/directory/TN/structure-group", permanent: true },
      { source: "/directory/TN/connell-law-pllc-ngcu", destination: "/directory/TN/connell-law-pllc", permanent: true },
      { source: "/directory/TN/180-degrees-ministries--ple4", destination: "/directory/TN/180-degrees-ministries", permanent: true },
      { source: "/directory/TN/hypergen-ai-dol9", destination: "/directory/TN/hypergen-ai", permanent: true },
      { source: "/directory/TN/cynthias-consulting-inc-bzqp", destination: "/directory/TN/cynthias-consulting-inc", permanent: true },
      { source: "/directory/TN/planw3st-llc-pycx", destination: "/directory/TN/planw3st-llc", permanent: true },
      { source: "/directory/TN/red-realty-senior-real-estate-specialist-kerd", destination: "/directory/TN/red-realty-senior-real-estate-specialist", permanent: true },
      { source: "/directory/TN/independent-roofing-specialists-8nut", destination: "/directory/TN/independent-roofing-specialists", permanent: true },
      { source: "/directory/TN/reed-associates-9mh4", destination: "/directory/TN/reed-associates", permanent: true },
      { source: "/directory/TN/inforule-social-media-o4os", destination: "/directory/TN/inforule-social-media", permanent: true },
    ];
  },
};

export default nextConfig;
