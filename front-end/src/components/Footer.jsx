import React from 'react';
import { Mail, Headset } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Investment Plans', href: '#/lans' },
    { label: 'FAQ', href: '/faq' }
  ];

  const legalLinks = [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Risk Disclosure', href: '/risk' },
    { label: 'KYC & AML Policy', href: '/kyc' }
  ];

  return (
    <footer className="bg-blue-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">TradeX</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              TradeX is a digital investment platform offering access to forex and cryptocurrency opportunities through secure, transparent systems.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-300 hover:underline transition-colors text-sm inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-300 hover:underline transition-colors text-sm inline-block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@tradex.com"
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-300 transition-colors text-sm group"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="group-hover:underline">support@tradex.com</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <Headset className="w-5 h-5 flex-shrink-0" />
                <span>24/7 Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-blue-800 mb-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 text-sm">
          {/* Copyright */}
          <div className="text-gray-400">
            © {currentYear} TradeX. All rights reserved.
          </div>

          {/* Disclaimer */}
          <div className="text-gray-400 max-w-2xl text-right">
            <span className="font-semibold text-gray-300">DISCLAIMER:</span> You agree to be of legal age in your country to partake in this program, and in all the cases your minimal age must be 18 years.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;