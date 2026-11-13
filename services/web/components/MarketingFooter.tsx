'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingModals, ModalType } from '@/components/LandingModals';

export function MarketingFooter() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="mt-auto bg-[#1E225B] text-slate-300 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            {/* Column 1: Brand & Mission */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/brand/logo-icon.jpg"
                  alt="GuruMera"
                  className="w-8 h-8 rounded-lg bg-white p-0.5 object-contain"
                />
                <span className="text-xl font-bold text-white tracking-tight">GuruMera</span>
              </div>
              <p className="text-xs font-semibold text-[#F5921D] tracking-wide">
                – Discover the Why! –
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                The multi-tenant academic platform and Public Socratic Learning Hub built to inspire curiosity, prevent cheating, and nurture lifelong independent problem-solving.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/hub" className="hover:text-white transition-colors">Public Learning Hub</Link></li>
                <li><Link href="/hub" className="hover:text-white transition-colors">Socratic AI Tutor</Link></li>
                <li><Link href="/hub" className="hover:text-white transition-colors">2-Tier Flashcards</Link></li>
                <li><Link href="/hub" className="hover:text-white transition-colors">Knowledge Maps</Link></li>
                <li><Link href="/hub" className="hover:text-white transition-colors">Peer Whiteboards</Link></li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Solutions</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/hub" className="hover:text-white transition-colors">Independent Learners</Link></li>
                <li><Link href="/try-teacher" className="hover:text-white transition-colors">Teacher Sandbox</Link></li>
                <li><Link href="/schools" className="hover:text-white transition-colors">Schools &amp; Academies</Link></li>
                <li><Link href="/parent" className="hover:text-white transition-colors">Parents &amp; Guardians</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Plans &amp; Pricing</Link></li>
              </ul>
            </div>

            {/* Column 4: Compliance & Support */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Trust &amp; Legal</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-white text-left transition-colors"
                  >
                    FERPA &amp; COPPA Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-white text-left transition-colors"
                  >
                    Terms &amp; Academic Integrity
                  </button>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white text-left transition-colors">
                    Plans &amp; Pricing
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('faq')}
                    className="hover:text-white text-left transition-colors"
                  >
                    Help Center &amp; FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('contact')}
                    className="hover:text-white text-left transition-colors"
                  >
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div>Copyright &copy; 2026 GuruMera. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <span>&bull;</span>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <span>&bull;</span>
              <Link href="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <LandingModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
}
