import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement | Networking For Awesome People",
  description: "Our commitment to digital accessibility and WCAG 2.1 Level AA compliance.",
  alternates: { canonical: "https://networkingforawesomepeople.com/accessibility" },
};

export default function AccessibilityPage() {
  const reviewDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto text-center">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">Accessibility Statement</h1>
          <p className="text-gold text-lg italic">Our commitment to digital accessibility for everyone</p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto prose prose-lg prose-navy prose-headings:font-heading">
          <p>Networking For Awesome People is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.</p>

          <h2>Our Commitment</h2>
          <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible to people with disabilities.</p>

          <h2>Standards We Follow</h2>
          <p>Our website works toward meeting WCAG 2.1 Level AA success criteria, which covers:</p>
          <p><strong>Perceivable</strong>  -  Information and interface components are presentable in ways all users can perceive, including text alternatives for images and sufficient color contrast.</p>
          <p><strong>Operable</strong>  -  All functionality is available from a keyboard, and users have enough time to read and use content.</p>
          <p><strong>Understandable</strong>  -  Content and operation of the interface is understandable, with readable text and predictable navigation.</p>
          <p><strong>Robust</strong>  -  Content is robust enough to be interpreted by a wide variety of assistive technologies, including screen readers.</p>

          <h2>What We Have Done</h2>
          <ul>
            <li>Ensured text meets minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)</li>
            <li>Added descriptive alternative text to images</li>
            <li>Ensured all interactive elements are keyboard accessible</li>
            <li>Added visible focus indicators throughout the site</li>
            <li>Properly labeled all form fields</li>
            <li>Added skip navigation for screen reader users</li>
            <li>Used semantic HTML elements and ARIA landmarks</li>
            <li>Ensured the site works at 200% browser zoom</li>
          </ul>

          <h2>Known Limitations</h2>
          <p>We are continuously working to improve accessibility. Some third-party content, such as embedded maps, may not fully meet our accessibility standards. We are working to address these limitations.</p>

          <h2>Feedback and Contact</h2>
          <p>We welcome your feedback on the accessibility of the Networking For Awesome People website. If you experience accessibility barriers, please <a href="/contact">contact us</a>.</p>
          <p>We aim to respond to accessibility feedback within 2 business days.</p>

          <h2>Last Reviewed</h2>
          <p>This statement was last reviewed and updated on {reviewDate}.</p>
          <p>The current WCAG standard we target is WCAG 2.1 Level AA, published by the World Wide Web Consortium (W3C). Learn more at <a href="https://www.w3.org/WAI/standards-guidelines/wcag/" target="_blank" rel="noopener noreferrer">w3.org/WAI/standards-guidelines/wcag</a>.</p>
        </div>
      </section>
    </>
  );
}
