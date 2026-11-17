'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

export const fieldCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600 mb-1 block">{label}</span>
      {children}
      {hint && <span className="text-xs text-gray-400 mt-1 block">{hint}</span>}
    </label>
  );
}

export function OnboardingShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">← GuruMera</Link>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mt-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">{subtitle}</p>
          {children}
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

export function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{message}</div>;
}

export const GRADES = [6, 7, 8, 9, 10, 11, 12, 13];
