import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const lastUpdated = "April 29, 2026";

const sections = [
  {
    title: "General Risk Warning",
    content:
      "Trading and investing in financial markets, including forex and cryptocurrencies, involve substantial risk and may result in the loss of your entire invested capital. You should carefully consider whether trading or investing is appropriate for you in light of your financial circumstances, investment objectives, and level of experience.",
  },
  {
    title: "No Guarantee of Profits",
    content:
      "TradeX does not guarantee profits, returns, or any specific investment outcomes. All investments are subject to market conditions, volatility, and risk factors that are beyond the platform's control. Past performance of any asset, strategy, or trading approach is not indicative of future results.",
  },
  {
    title: "Market Volatility",
    content:
      "Cryptocurrency and forex markets are highly volatile in nature. Asset prices can fluctuate rapidly and significantly within short periods of time due to factors including, but not limited to, shifts in market demand, macroeconomic developments, regulatory changes, geopolitical events, and market sentiment.",
  },
  {
    title: "Loss of Capital",
    content:
      "Users may lose part or all of their invested funds. There is no assurance that you will recover any amount of the capital you invest. You should only invest funds that you can afford to lose entirely without adversely affecting your financial situation or personal obligations.",
  },
  {
    title: "Trading Risks",
    content:
      "Active trading carries additional risks beyond standard investment risk. These include but are not limited to rapid and unpredictable price movements, reduced market liquidity during certain periods, execution delays, slippage, and the possibility of positions being closed at unfavorable prices.",
  },
  {
    title: "Leverage Risk",
    content:
      "Where leveraged trading is made available, users should be aware that leverage can significantly amplify both potential gains and potential losses relative to the initial capital deployed. Losses may exceed the original amount invested. Users should fully understand how leverage works and the risks it entails before engaging in leveraged trading activity.",
  },
  {
    title: "Technology Risks",
    content:
      "TradeX is not responsible for any losses or damages caused by system failures, server outages, network disruptions, cybersecurity incidents, or other technical issues that are beyond its reasonable control. The platform is provided on an 'as available' basis, and uninterrupted access cannot be guaranteed.",
  },
  {
    title: "User Responsibility",
    content:
      "Users are solely responsible for making their own investment and trading decisions. TradeX does not provide financial, investment, tax, or legal advice. Nothing communicated through the platform, its representatives, or any associated materials should be construed as professional financial advice. Users are encouraged to seek independent professional guidance before making any investment decisions.",
  },
  {
    title: "Regulatory Risks",
    content:
      "The regulatory environment for financial services, cryptocurrencies, and digital assets continues to evolve. Changes in applicable laws, regulations, or government policies in any jurisdiction may impact the availability, legality, or functionality of services provided by TradeX. Such changes may occur without prior notice and could materially affect your ability to use the platform.",
  },
  {
    title: "Acceptance of Risk",
    content:
      "By accessing and using the TradeX platform, you confirm that you have read, understood, and accept the risks described in this disclosure. You acknowledge that TradeX is not liable for any losses arising from your use of the platform or your participation in financial markets through it.",
  },
  {
    title: "Contact",
    contact: true,
  },
];

export default function RiskDisclosure() {
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
              Risk Disclosure
            </h1>
            <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16 space-y-10">

          {/* Preamble */}
          <section>
            <p className="text-slate-600 text-base leading-relaxed">
              This Risk Disclosure Statement is provided by TradeX to ensure
              that users are fully informed of the risks associated with trading
              and investing in financial markets. Please read this document
              carefully before using any services offered by TradeX.
            </p>
          </section>

          <hr className="border-slate-100" />

          {/* Numbered sections */}
          {sections.map((section, idx) => (
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

              {section.contact && (
                <p className="text-slate-600 text-base leading-relaxed">
                  For questions or concerns regarding this Risk Disclosure
                  Statement, please contact our support team at{" "}
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

          {/* Closing note */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-400 leading-relaxed">
              This disclosure does not constitute financial advice. TradeX
              strongly recommends that all users seek independent professional
              advice before making any investment or trading decisions.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}