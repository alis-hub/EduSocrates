'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { GRADES, fieldCls } from '@/components/OnboardingShell';

type ClassRow = {
  sectionId: string; sectionName: string; className: string; gradeLevel: number;
  subjectName: string; studentCount: number;
  joinCode?: { code: string; expiresAt?: string } | null;
};

export function TeacherClassesPanel({ canCreate: canCreateProp }: { canCreate: boolean }) {
  const [allowed, setAllowed] = useState(false);
  const canCreate = canCreateProp && allowed;
  useEffect(() => { api.teacherClasses.capabilities().then(r => setAllowed(!!r.canCreate)).catch(() => setAllowed(false)); }, []);
  const [rows, setRows] = useState<ClassRow[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ className: '', gradeLevel: '9', subjectName: '', sectionName: '' });

  const load = useCallback(async () => {
    try { setRows(await api.teacherClasses.list()); setErr(''); }
    catch (e: any) { setErr(e?.message || 'Could not load classes.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(fn: () => Promise<any>) {
    try { await fn(); await load(); } catch (e: any) { setErr(e?.message || 'Something went wrong.'); }
  }
  async function toggleRoster(id: string) {
    if (open === id) { setOpen(null); return; }
    setOpen(id);
    try { setRoster(await api.teacherClasses.students(id)); } catch (e: any) { setErr(e?.message || ''); }
  }
  async function addClass(e: React.FormEvent) {
    e.preventDefault();
    await act(() => api.teacherClasses.create({
      className: f.className, gradeLevel: Number(f.gradeLevel), subjectName: f.subjectName,
      sectionName: f.sectionName.trim() || undefined,
    }));
    setAdding(false);
    setF({ className: '', gradeLevel: '9', subjectName: '', sectionName: '' });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">My Classes</h2>
        {canCreate && <button onClick={() => setAdding(a => !a)} className="text-sm text-blue-600 font-medium">{adding ? 'Cancel' : '+ Add class'}</button>}
      </div>
      {err && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}
      {adding && (
        <form onSubmit={addClass} className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-2 gap-3">
          <input required placeholder="Class (e.g. Class 9)" maxLength={64} className={fieldCls} value={f.className} onChange={e => setF(p => ({ ...p, className: e.target.value }))} />
          <select className={fieldCls} value={f.gradeLevel} onChange={e => setF(p => ({ ...p, gradeLevel: e.target.value }))}>
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <input required placeholder="Subject" maxLength={100} className={fieldCls} value={f.subjectName} onChange={e => setF(p => ({ ...p, subjectName: e.target.value }))} />
          <input placeholder="Section (optional)" maxLength={64} className={fieldCls} value={f.sectionName} onChange={e => setF(p => ({ ...p, sectionName: e.target.value }))} />
          <button className="col-span-2 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold">Create class</button>
        </form>
      )}
      {rows.length === 0 && !err && <div className="text-center py-12 text-gray-400">No classes yet.</div>}
      {rows.map(r => (
        <div key={r.sectionId} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900">{r.className} · {r.subjectName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Grade {r.gradeLevel} · Section {r.sectionName} · {r.studentCount} students</p>
            </div>
            <div className="text-right">
              {r.joinCode ? (
                <>
                  <div className="font-mono font-bold tracking-widest text-blue-700">{r.joinCode.code}</div>
                  <div className="text-xs mt-1 space-x-3">
                    <button onClick={() => navigator.clipboard?.writeText(r.joinCode!.code)} className="text-blue-600">Copy</button>
                    <button onClick={() => act(() => api.teacherClasses.rotateCode(r.sectionId))} className="text-gray-500">New code</button>
                    <button onClick={() => act(() => api.teacherClasses.revokeCode(r.sectionId))} className="text-red-600">Turn off</button>
                  </div>
                </>
              ) : (
                <button onClick={() => act(() => api.teacherClasses.rotateCode(r.sectionId))} className="text-sm text-blue-600 font-medium">Create join code</button>
              )}
            </div>
          </div>
          <button onClick={() => toggleRoster(r.sectionId)} className="text-xs text-gray-500 mt-3">{open === r.sectionId ? 'Hide students' : 'Show students'}</button>
          {open === r.sectionId && (
            <ul className="mt-2 divide-y divide-gray-50 text-sm">
              {roster.length === 0 && <li className="py-2 text-gray-400">No students yet. Share the code above.</li>}
              {roster.map((s: any) => (
                <li key={s.id} className="py-2 flex items-center justify-between">
                  <span>{s.firstName} {s.lastName} <span className="text-gray-400 text-xs">{s.email}</span></span>
                  <button onClick={async () => { await act(() => api.teacherClasses.removeStudent(r.sectionId, s.id)); setRoster(await api.teacherClasses.students(r.sectionId)); }} className="text-xs text-red-600">Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
