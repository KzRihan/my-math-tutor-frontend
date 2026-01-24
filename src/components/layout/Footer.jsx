import Link from 'next/link';
import { APP_NAME, SOCIAL_LINKS } from '@/lib/constants';
import { FaCalculator, FaInstagram, FaYoutube, FaDiscord, FaHeart } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Topics', href: '/topics' },
      { label: 'Mobile App', href: '#' }
    ],
    resources: [
      { label: 'Help Center', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Tutorials', href: '#' },
      { label: 'API Docs', href: '#' }
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Press', href: '#' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' }
    ]
  };

  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-white relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/5 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10">
        {/* Main Footer Content */}
        <div className="py-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 md:gap-8">
            {/* Brand */}
            <div className="col-span-2 space-y-6">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <FaCalculator className="text-3xl text-primary-500" />
                <span className="font-display font-bold text-2xl group-hover:text-primary-400 transition-colors">{APP_NAME}</span>
              </Link>
              <p className="text-neutral-400 leading-relaxed max-w-sm">
                Your personal AI mathematics tutor. Learn smarter, not harder, with personalized guidance tailored to your pace.
              </p>
              <div className="flex gap-3">
                <a
                  href={SOCIAL_LINKS.twitter}
                  className="w-12 h-12 rounded-xl bg-neutral-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <FaXTwitter className="text-xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  className="w-12 h-12 rounded-xl bg-neutral-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  className="w-12 h-12 rounded-xl bg-neutral-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <FaYoutube className="text-xl" />
                </a>
                <a
                  href={SOCIAL_LINKS.discord}
                  className="w-12 h-12 rounded-xl bg-neutral-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord"
                >
                  <FaDiscord className="text-xl" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg mb-6">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-neutral-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © {currentYear} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 text-sm">Made with</span>
              <FaHeart className="text-lg animate-pulse text-purple-500" />
              <span className="text-neutral-500 text-sm">in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
