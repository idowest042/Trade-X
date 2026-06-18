import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sections = [
  {
    title: "Introduction",
    content:
      "These Terms and Conditions govern your use of the TradeX platform. By accessing or using our services, you agree to comply with and be bound by these terms. If you do not agree to these terms, you may not access or use the platform.",
  },
  {
    title: "Eligibility",
    content:
      "You must be at least 18 years old to use TradeX. By registering an account, you confirm that you meet this age requirement and that all information you provide during registration is accurate, current, and complete. TradeX reserves the right to suspend or terminate accounts found to be in violation of this requirement.",
  },
  {
    title: "Account Responsibility",
    content:
      "Users are solely responsible for maintaining the confidentiality of their account credentials, including passwords and authentication details. You are responsible for all activities that occur under your account. You agree to notify TradeX immediately of any unauthorized use of your account or any other security breach.",
  },
  {
    title: "KYC & Verification",
    content:
      "TradeX requires identity verification (Know Your Customer) to comply with applicable regulatory standards and anti-money laundering obligations. Users must submit valid government-issued documentation to access full platform features, including the ability to make withdrawals. Failure to complete verification may result in limited access or account suspension.",
  },
  {
    title: "Deposits & Withdrawals",
    content:
      "All deposits and withdrawals on the TradeX platform are subject to verification and security review. Processing times may vary depending on network conditions, payment method, and internal review procedures. TradeX does not guarantee specific processing timelines and reserves the right to delay or decline transactions that raise compliance or security concerns.",
  },
  {
    title: "Trading & Investment Risk",
    content:
      "Trading and investing in financial markets, including cryptocurrencies and forex, involve significant risk. Users acknowledge and accept that they may lose part or all of their invested capital. Past performance is not indicative of future results. TradeX does not guarantee profits and is not responsible for any trading or investment losses incurred by users.",
  },
  {
    title: "Prohibited Activities",
    content: null,
    list: [
      "Engaging in fraudulent activity or misrepresentation of identity or financial information.",
      "Creating multiple accounts to abuse platform features, bonuses, or verification systems.",
      "Using the platform to conduct or facilitate money laundering or any other illegal financial activity.",
      "Attempting unauthorized access to TradeX systems, servers, or other users' accounts.",
      "Manipulating markets or engaging in any form of abusive trading behavior.",
    ],
  },
  {
    title: "Platform Availability",
    content:
      "TradeX does not guarantee uninterrupted, error-free access to the platform. Services may be temporarily suspended or restricted due to scheduled maintenance, security upgrades, or circumstances beyond our control. TradeX shall not be held liable for any losses or inconveniences resulting from platform downtime or service interruptions.",
  },
  {
    title: "Limitation of Liability",
    content:
      "To the fullest extent permitted by applicable law, TradeX shall not be held liable for any direct, indirect, incidental, consequential, or special damages arising from or related to your use of the platform, including but not limited to trading losses, data loss, or service interruptions. Your use of TradeX is at your own risk.",
  },
  {
    title: "Account Suspension & Termination",
    content:
      "TradeX reserves the right to suspend, restrict, or permanently terminate any account that is found to be in violation of these Terms and Conditions, engaged in suspicious or fraudulent activity, or otherwise posing a risk to the platform or its users. Users will be notified where possible, subject to legal and compliance obligations.",
  },
  {
    title: "Changes to Terms",
    content:
      "TradeX may update or revise these Terms and Conditions at any time without prior notice. Changes will be effective immediately upon posting to the platform. Your continued use of TradeX following any updates constitutes your acceptance of the revised terms. We encourage users to review this page periodically.",
  },
  {
    title: "Contact Information",
    content: null,
    contact: true,
  },
];

export default function TermsConditions() {
  const lastUpdated = "April 29, 2026";

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
              Terms &amp; Conditions
            </h1>
            <p className="text-sm text-slate-500">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10">

          {/* Introduction paragraph (no heading) */}
          <section>
            <p className="text-slate-600 text-base leading-relaxed">
              These Terms and Conditions govern your use of the TradeX platform.
              By accessing or using our services, you agree to comply with and
              be bound by these terms. If you do not agree to these terms, you
              may not access or use the platform.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Numbered sections */}
          {sections.slice(1).map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2
                className="text-lg font-semibold text-slate-900"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {idx + 1}. {section.title}
              </h2>

              {section.content && (
                <p className="text-slate-600 text-base leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-2 pl-1">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex gap-3 text-slate-600 text-base leading-relaxed">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.contact && (
                <p className="text-slate-600 text-base leading-relaxed">
                  For questions or concerns regarding these Terms and Conditions,
                  please contact our support team at{" "}
                  <a
                    href="mailto:support@tradex.com"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    support@tradex.com
                  </a>
                  . We aim to respond to all inquiries within 2–3 business days.
                </p>
              )}
            </section>
          ))}

          {/* Footer note */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-400 leading-relaxed">
              By using TradeX, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and Conditions.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}