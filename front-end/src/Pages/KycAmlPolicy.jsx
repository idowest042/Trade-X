import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const lastUpdated = "April 29, 2026";

export default function KycAmlPolicy() {
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
              KYC &amp; AML Policy
            </h1>
            <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10">

          {/* Introduction */}
          <section>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX is committed to preventing fraud, money laundering, and
              other illegal financial activities on its platform. This KYC (Know
              Your Customer) and AML (Anti-Money Laundering) Policy outlines the
              procedures and requirements used to verify user identity and ensure
              full compliance with applicable regulations. All users of the
              TradeX platform are subject to this policy.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* 1. Identity Verification (KYC) */}
          <section className="space-y-4">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              1. Identity Verification (KYC)
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              All users are required to complete identity verification before
              accessing certain platform features, including but not limited to
              the ability to make withdrawals. TradeX will not process withdrawal
              requests from accounts that have not completed the verification
              process.
            </p>

            <div className="space-y-3 pt-1">
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Required Information
              </p>
              <ul className="space-y-2 pl-1">
                {[
                  "Full legal name",
                  "Date of birth",
                  "Nationality",
                  "Current residential address",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Required Documents
              </p>
              <ul className="space-y-2 pl-1">
                {[
                  "A valid government-issued photo ID — such as a passport, driver's license, or national identity card.",
                  "Proof of address (e.g. utility bill or bank statement), where required by the compliance team.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                    <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 2. Verification Process */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              2. Verification Process
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              All submitted documents are reviewed by the TradeX compliance
              team. Users will be notified of the outcome of their verification
              review. Verification times may vary depending on the accuracy,
              completeness, and legibility of the information and documents
              provided. Submitting incomplete or invalid documentation may result
              in delays or rejection of the verification request.
            </p>
          </section>

          {/* 3. AML Compliance */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              3. AML Compliance
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX actively monitors transactions and account activity to
              detect and prevent suspicious behavior, including but not limited
              to money laundering, fraud, and financing of illegal activities.
              Our AML procedures include:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "Ongoing transaction monitoring to identify unusual or high-risk activity.",
                "Risk-based assessments of user accounts and transaction patterns.",
                "Reporting of suspicious activities to relevant regulatory authorities in accordance with applicable law.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Prohibited Activities */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              4. Prohibited Activities
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              The following activities are strictly prohibited on the TradeX
              platform and may result in immediate account suspension or
              termination:
            </p>
            <ul className="space-y-2 pl-1">
              {[
                "Providing false, misleading, or fraudulent identity information during registration or verification.",
                "Engaging in or facilitating fraudulent transactions of any kind.",
                "Attempting to bypass, circumvent, or manipulate the identity verification process.",
                "Using the platform to conduct illegal financial activities, including but not limited to money laundering or terrorist financing.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                  <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Account Restrictions */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              5. Account Restrictions
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX reserves the right to restrict, limit, suspend, or
              permanently terminate any account that fails to pass verification
              checks, provides inaccurate information, or is suspected of
              violating AML regulations. In such cases, pending transactions may
              be held pending further review, and funds may be withheld pending
              regulatory guidance where applicable.
            </p>
          </section>

          {/* 6. Data Handling */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              6. Data Handling
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              All identity verification data and documentation submitted by
              users is handled securely and used solely for compliance, security,
              and regulatory purposes. Verification data is stored in accordance
              with our{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </a>{" "}
              and is not shared with third parties except where required by law
              or regulatory obligation.
            </p>
          </section>

          {/* 7. Regulatory Cooperation */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              7. Regulatory Cooperation
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX cooperates fully with relevant regulatory, law enforcement,
              and government authorities. Where required by applicable law or
              upon receipt of a lawful request, TradeX may disclose user
              information, transaction records, and verification documents to
              such authorities without prior notice to the user.
            </p>
          </section>

          {/* 8. Policy Updates */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              8. Policy Updates
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              TradeX reserves the right to update or amend this KYC &amp; AML
              Policy at any time to reflect changes in applicable regulations,
              internal compliance procedures, or operational requirements. Updates
              will be effective immediately upon publication. Continued use of
              the platform constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* 9. Contact */}
          <section className="space-y-3">
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              9. Contact
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              For questions, concerns, or inquiries regarding this KYC &amp; AML
              Policy, please contact our compliance team at{" "}
              <a
                href="mailto:support@tradex.com"
                className="text-blue-600 hover:underline font-medium"
              >
                support@tradex.com
              </a>
              . We aim to respond to all compliance-related inquiries within 2–3
              business days.
            </p>
          </section>

          {/* Closing note */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-400 leading-relaxed">
              By registering and using the TradeX platform, you acknowledge that
              you have read, understood, and agree to comply with this KYC &amp;
              AML Policy in its entirety.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}