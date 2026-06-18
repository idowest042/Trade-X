import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const lastUpdated = "April 29, 2026";

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />

      <main className="bg-white min-h-screen">

        {/* ── Page Title ───────────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
            <h1
              className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10">

          {/* Introduction */}
          <section>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX is committed to protecting your personal information. This
              Privacy Policy explains how we collect, use, store, and safeguard
              your data when you access or use our platform. By using TradeX,
              you consent to the practices described in this policy.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 1. Information We Collect */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              1. Information We Collect
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              In order to provide our services, TradeX may collect the following
              categories of information:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "Personal information, including your full name, email address, and phone number.",
                "Identity verification documents submitted as part of our KYC (Know Your Customer) process.",
                "Transaction data, including deposit and withdrawal records and trading activity.",
                "Device and usage data, such as IP address, browser type, and interaction logs.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              2. How We Use Your Information
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              The information we collect is used for the following purposes:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "To provide, operate, and maintain our platform and services.",
                "To process transactions and manage account activity.",
                "To verify user identity and comply with KYC and anti-money laundering regulations.",
                "To improve user experience and optimize platform performance.",
                "To communicate with users regarding account activity, updates, and support.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Data Protection */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              3. Data Protection
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX implements appropriate technical and organizational measures
              to protect user data from unauthorized access, alteration, loss,
              or misuse. These measures include encryption, access controls, and
              regular security assessments. While we take data security
              seriously, no method of transmission over the internet is entirely
              secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* 4. Sharing of Information */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              4. Sharing of Information
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX does not sell, rent, or trade your personal data to third
              parties. However, information may be shared in the following
              limited circumstances:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "With regulatory or law enforcement authorities when required by applicable law or legal process.",
                "With trusted service providers who support the operation of our platform, subject to strict confidentiality obligations.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Cookies & Tracking */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              5. Cookies &amp; Tracking
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX may use cookies and similar tracking technologies to
              enhance user experience, remember preferences, and analyze how our
              platform is used. You may configure your browser settings to
              decline cookies; however, doing so may affect the functionality of
              certain platform features.
            </p>
          </section>

          {/* 6. User Rights */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              6. User Rights
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Subject to applicable law, users have the following rights
              regarding their personal data:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "The right to access the personal data we hold about you.",
                "The right to request corrections to inaccurate or incomplete data.",
                "The right to request deletion of your data, where permitted by law and regulatory requirements.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-600 text-base leading-relaxed">
              To exercise any of these rights, please contact our support team
              using the details provided below.
            </p>
          </section>

          {/* 7. Data Retention */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              7. Data Retention
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX retains user data only for as long as necessary to fulfill
              the purposes described in this policy, or as required by
              applicable legal, regulatory, and operational obligations. When
              data is no longer required, it is securely deleted or anonymized.
            </p>
          </section>

          {/* 8. Third-Party Services */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              8. Third-Party Services
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX may integrate or rely on third-party tools and services to
              support platform functionality. These third parties operate under
              their own privacy policies and data practices. We encourage users
              to review the privacy policies of any third-party services they
              interact with through our platform.
            </p>
          </section>

          {/* 9. Updates to Policy */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              9. Updates to This Policy
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX may update this Privacy Policy from time to time to reflect
              changes in our practices or applicable regulations. When updates
              are made, the "Last updated" date at the top of this page will be
              revised. Continued use of the platform following any changes
              constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              10. Contact
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              If you have questions, concerns, or requests regarding this
              Privacy Policy or how your data is handled, please contact our
              support team at{" "}
              <a
                href="mailto:support@tradex.com"
                className="text-blue-600 hover:underline font-medium"
              >
                support@tradex.com
              </a>
              . We aim to respond to all privacy-related inquiries within 2–3
              business days.
            </p>
          </section>

          {/* Closing note */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-400 leading-relaxed">
              By using TradeX, you acknowledge that you have read and understood
              this Privacy Policy and consent to the collection and use of your
              information as described herein.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}