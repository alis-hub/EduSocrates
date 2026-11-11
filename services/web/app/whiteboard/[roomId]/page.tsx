'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, getStoredUser } from '@/lib/api';
import { WhiteboardCanvas } from '@/components/WhiteboardCanvas';
import { ArrowLeft, Check, Copy } from 'lucide-react';

export default function WhiteboardRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId || '';
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState('Learner');

  useEffect(() => {
    const u = getStoredUser();
    if (u?.firstName) setUserName(`${u.firstName} ${u.lastName || ''}`.trim());
    if (!roomId) return;
    api.hub
      .getWhiteboardRoom(roomId)
      .then((res) => setRoom(res.room))
      .catch((err) => setError(err.message || 'Unable to load whiteboard room'));
  }, [roomId]);

  const copyInvite = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-6 py-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/hub"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Hub
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              {room?.title || 'Collaborative Study Whiteboard'}
            </h1>
            {room?.coursework_title && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                {room.coursework_title}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={copyInvite}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied!' : 'Share Room URL'}
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-sm">
            {error}
          </div>
        ) : !room ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            Loading whiteboard state...
          </div>
        ) : (
          <WhiteboardCanvas roomId={room.id} initialState={room.canvas_state} userName={userName} />
        )}
      </div>
    </div>
  );
}
