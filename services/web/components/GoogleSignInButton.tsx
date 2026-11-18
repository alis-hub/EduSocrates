'use client';

import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

/** True when Google sign-in is configured for this build. */
export const googleSignInEnabled = Boolean(GOOGLE_CLIENT_ID);

/**
 * Google's own sign-in button (Google Identity Services). On success it hands back a Google ID
 * token; the API verifies that token server-side. Renders nothing if no client ID is configured.
 */
export function GoogleSignInButton({
  onCredential,
  text = 'continue_with',
}: {
  onCredential: (idToken: string) => void;
  text?: 'continue_with' | 'signup_with' | 'signin_with';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const cbRef = useRef(onCredential);
  cbRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const init = () => {
      const g = (window as any).google?.accounts?.id;
      if (!g || !ref.current) return;
      g.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r: { credential: string }) => cbRef.current(r.credential),
      });
      g.renderButton(ref.current, { theme: 'outline', size: 'large', width: 340, text });
    };
    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }
    let script = document.getElementById('gsi-client') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script?.removeEventListener('load', init);
  }, [text]);

  if (!GOOGLE_CLIENT_ID) return null;
  return (
    <div className="flex justify-center">
      <div ref={ref} />
    </div>
  );
}
