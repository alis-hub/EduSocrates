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
              {activeModal === 'privacy' && 'FERPA & COPPA Student Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service & Academic Integrity'}
              {activeModal === 'faq' && 'Frequently Asked Questions (FAQ)'}
              {activeModal === 'pricing' && 'GuruMera Plans & Pricing Tiers'}
              {activeModal === 'contact' && 'Contact Support & Institutional Sales'}
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
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-medium">
                🛡️ GuruMera is architected in full alignment with the Family Educational Rights and Privacy Act (FERPA) and the Children&apos;s Online Privacy Protection Act (COPPA).
              </div>
              <h4 className="font-bold text-[#1E225B]">1. Zero Commercial Sale of Student Data</h4>
              <p>
                GuruMera does not sell, rent, monetize, or profile student data, learning dialogues, or student coursework for commercial advertising. Learner interactions are strictly processed to provide Socratic educational guidance.
              </p>
              <h4 className="font-bold text-[#1E225B]">2. Multi-Tenant School Isolation</h4>
              <p>
                Institutional data (classes, rubrics, submissions, and teacher transcripts) is isolated using PostgreSQL Row-Level Security (RLS) scoped strictly by School ID. No institutional data is visible to external public users.
              </p>
              <h4 className="font-bold text-[#1E225B]">3. Redaction &amp; Safety Filters</h4>
              <p>
                Student personal identifiers (PII such as phone numbers, emails, and student ID numbers) are redacted in real time before AI processing to guarantee privacy and security.
              </p>
            </div>
          )}

          {/* Terms of Service */}
          {activeModal === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#1E225B]">1. The Socratic Honor Code</h4>
              <p>
                GuruMera is designed to build independent problem-solving habits. Users agree not to attempt to bypass, jailbreak, or tamper with the 5-layer academic guardrails to extract unearned homework solutions or answer keys.
              </p>
              <h4 className="font-bold text-[#1E225B]">2. Acceptable Use</h4>
              <p>
                Users agree not to upload malicious software, abusive language, or infringing materials to collaborative whiteboards or peer discussion boards. GuruMera reserves the right to suspend accounts violating community safety standards.
              </p>
              <h4 className="font-bold text-[#1E225B]">3. Educational Disclaimer</h4>
              <p>
                While our pedagogical models are rigorously tuned and audited, GuruMera is an educational study companion. Teachers and academic institutions retain final evaluation and grading authority for all official coursework.
              </p>
            </div>
          )}

          {/* FAQ */}
          {activeModal === 'faq' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Is the Public Learning Hub really 100% free?',
                  a: 'Yes! Anyone can visit the Public Hub (/hub) immediately to explore Socratic tutoring, 2-tier flashcards, concept knowledge trees, and collaborative whiteboards without any paywall.',
                },
                {
                  q: 'How does GuruMera prevent students from cheating?',
                  a: 'Our server-side AI Gateway uses a 5-layer defense: Layer 1 prompt-injection sanitization, Layer 2 intent classification, Layer 3 Socratic system directives, Layer 4 teacher rubric context injection, and Layer 5 real-time output verification that immediately intercepts direct solution leaks.',
                },
                {
                  q: 'What happens if a student uses the Public Hub and their school joins later?',
                  a: 'Students keep 100% of their learning continuity! Simply enter your school Invite Code on your profile, and all existing flashcards, study streaks, and earned XP link seamlessly into your school roster.',
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
                  <span className="text-xs font-bold text-[#249EA0] uppercase tracking-wider">Independent Learners</span>
                  <h4 className="text-xl font-black text-[#1E225B] mt-1">Free Forever</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">For students, parents, and self-directed learners everywhere.</p>
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
                  <span className="text-xs font-bold text-[#F5921D] uppercase tracking-wider">Schools &amp; Academies</span>
                  <h4 className="text-xl font-black text-[#1E225B] mt-1">Campus Enterprise</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Complete multi-campus digital management and pedagogical safety.</p>
                  <ul className="text-xs space-y-2 text-slate-600">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Multi-Campus &amp; Class Roster Management</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Coursework-Linked Rubrics &amp; AI Strictness</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real-Time Teacher AI Audit Logs</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FERPA/COPPA Compliance Audit Trail</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Account Manager &amp; Onboarding</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Contact Support */}
          {activeModal === 'contact' && (
            <div>
              {contactSent ? (
                <div className="text-center py-8 space-y-2 bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-base">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-800">
                    Our educational partnerships team will reply to your inquiry within 1 business day.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSent(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Your Name *</label>
                    <input
                      required
                      placeholder="Jane Doe"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Your Work or School Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="teacher@school.edu"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Subject / Inquiry Type</label>
                    <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]">
                      <option>School Onboarding &amp; Academy Deployment</option>
                      <option>General Support / Question</option>
                      <option>Academic Integrity &amp; Pedagogy</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Message *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Tell us about your school, student population, or question..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#1E225B]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#1E225B] hover:bg-[#141740] text-white font-semibold py-2.5 rounded-lg text-xs transition-colors"
                  >
                    Submit Inquiry
                  </button>
                </form>
              )}
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
