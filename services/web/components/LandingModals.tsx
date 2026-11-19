'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

export type ModalType = 'privacy' | 'terms' | 'faq' | 'pricing' | 'contact' | null;

interface LandingModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export function LandingModals({ activeModal, onClose }: LandingModalsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [contactSent, setContactSent] = useState(false);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#FAF9F5]">
          <div className="flex items-center gap-2">
            {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#249EA0]" />}
            {activeModal === 'terms' && <Lock className="w-5 h-5 text-[#1E225B]" />}
            {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-[#F5921D]" />}
            {activeModal === 'pricing' && <Sparkles className="w-5 h-5 text-[#F5921D]" />}
            {activeModal === 'contact' && <Mail className="w-5 h-5 text-[#1E225B]" />}
            <h3 className="font-bold text-[#1E225B] text-base">
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service & Academic Integrity'}
              {activeModal === 'faq' && 'Frequently Asked Questions (FAQ)'}
              {activeModal === 'pricing' && 'Plans & Pricing'}
              {activeModal === 'contact' && 'Contact Us'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-slate-700">
          {/* Privacy Policy */}
          {activeModal === 'privacy' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Last updated: November 2026</p>
              <h4 className="font-bold text-[#1E225B]">1. What we collect</h4>
              <p>
                Your name, email address and a securely hashed password; the class or school you belong to; coursework, submissions, grades and teacher feedback; and your conversations with the AI tutor. We do not collect payment card details on this site.
              </p>
              <h4 className="font-bold text-[#1E225B]">2. Who can see it</h4>
              <p>
                Each school&apos;s data is kept separate from every other school&apos;s at the database level. Within a school, your teachers can see your coursework and your AI tutor conversations for their classes, and every time a teacher opens a conversation it is logged. A parent or guardian linked to a student by the school can see that student&apos;s coursework, grades and progress. Learners on the free Public Hub are separate from any school.
              </p>
              <h4 className="font-bold text-[#1E225B]">3. AI processing</h4>
              <p>
                Messages to the AI tutor are sent to our AI provider to produce a reply. Before sending, we try to remove phone numbers, email addresses and ID numbers from messages. This filter is automatic and not perfect, so please do not type personal details into the tutor.
              </p>
              <h4 className="font-bold text-[#1E225B]">4. What we do not do</h4>
              <p>
                We do not sell student data and we do not show advertising.
              </p>
              <h4 className="font-bold text-[#1E225B]">5. Children</h4>
              <p>
                GuruMera is for students in Grade 6 and above. A school or a parent should set up accounts for younger teenagers.
              </p>
              <h4 className="font-bold text-[#1E225B]">6. Your choices</h4>
              <p>
                To see, correct or delete your data, contact your school administrator or write to us using the Contact option. Schools can ask us to delete their workspace.
              </p>
            </div>
          )}

          {/* Terms of Service */}
          {activeModal === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#1E225B]">1. The Socratic Honor Code</h4>
              <p>
                GuruMera is designed to build independent problem-solving habits. Users agree not to attempt to bypass, jailbreak, or tamper with the tutor's safeguards to extract unearned homework solutions or answer keys.
              </p>
              <h4 className="font-bold text-[#1E225B]">2. Acceptable Use</h4>
              <p>
                Users agree not to upload malicious software, abusive language, or infringing materials to collaborative whiteboards or peer discussion boards. GuruMera reserves the right to suspend accounts violating community safety standards.
              </p>
              <h4 className="font-bold text-[#1E225B]">3. Educational Disclaimer</h4>
              <p>
                The AI tutor can make mistakes, so check important facts with your teacher or textbook. GuruMera is an educational study companion. Teachers and academic institutions retain final evaluation and grading authority for all official coursework.
              </p>
            </div>
          )}

          {/* FAQ */}
          {activeModal === 'faq' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Is the Public Learning Hub free?',
                  a: 'Yes, it is free to explore. Anyone can visit the Public Hub (/hub) immediately to explore Socratic tutoring, 2-tier flashcards, concept knowledge trees, and collaborative whiteboards without any paywall.',
                },
                {
                  q: 'How does GuruMera prevent students from cheating?',
                  a: 'The tutor is instructed to guide with questions instead of answers. Messages are screened for attempts to extract answers or override its rules, and replies are checked before they reach the student. Teachers can mark the correct answer so it is blocked from appearing. No system is perfect, and teachers can review each conversation.',
                },
                {
                  q: 'What happens if a student uses the Public Hub and their school joins later?',
                  a: 'Your Public Hub account stays yours. When a teacher gives you a class code, use it on the Join page to create a separate school account; your Hub progress is not moved into it.',
                },
                {
                  q: 'Can teachers test GuruMera before onboarding a whole school?',
                  a: 'Absolutely. Click "Try the Teacher Demo" on the homepage to launch an instant 2-hour ephemeral sandbox with pre-loaded physics assignments and simulated student prompts.',
                },
              ].map((item, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 p-3.5 flex justify-between items-center transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className="text-[#F5921D] font-bold text-lg">{openFaq === idx ? '−' : '+'}</span>
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pricing */}
          {activeModal === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Tier */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                  <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">Individual Students</span>
                  <h4 className="text-xl font-black text-[#1E225B] mt-1">Free</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">For individual students. Fair-use limits apply to AI tutor messages.</p>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Full Public Learning Hub access</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2-Tier Socratic Flashcard Generator</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Knowledge Maps &amp; Checkpoints</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Collaborative Whiteboards</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Continuous XP &amp; Study Streaks</li>
                  </ul>
                </div>

                {/* Institutional Tier */}
                <div className="border-2 border-[#1E225B] rounded-2xl p-5 bg-[#FAF9F5] shadow-xs">
                  <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">Schools, Academies &amp; Tutors</span>
                  <h4 className="text-xl font-black text-[#1E225B] mt-1">Schools &amp; Teachers</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Contact us for pricing: info@gurumera.com</p>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Classes, sections and rosters with class codes</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Coursework-Linked Rubrics &amp; AI Strictness</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real-Time Teacher AI Audit Logs</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Parent view with result acknowledgement</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Setup help by email</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          {activeModal === 'contact' && (
            <div className="space-y-3">
              <p>
                For school or academy pricing, a demo, or any question, email us and we will reply as soon as we can.
              </p>
              <a
                href="mailto:info@gurumera.com?subject=GuruMera%20enquiry"
                className="inline-flex items-center gap-2 bg-[#1E225B] hover:bg-[#141740] text-white font-bold px-5 py-3 rounded-xl text-sm"
              >
                <Mail className="w-4 h-4" /> info@gurumera.com
              </a>
              <p className="text-xs text-slate-500">
                Please include your school or academy name, your city and roughly how many students you teach.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>GuruMera &bull; Discover the Why!</span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
