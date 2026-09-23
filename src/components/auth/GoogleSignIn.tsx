"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";

type Identity = {
  initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select: boolean }) => void;
  renderButton: (element: HTMLElement, options: { type: string; theme: string; size: string }) => void;
};
declare global { interface Window { google?: { accounts: { id: Identity } }; } }

export function GoogleSignIn({ onCredential, disabled }: { onCredential: (token: string) => void; disabled: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  const [failed, setFailed] = useState(false);
  useEffect(() => { callback.current = onCredential; }, [onCredential]);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return null;
  const render = () => {
    const identity = window.google?.accounts.id;
    if (!element.current || !identity) return;
    identity.initialize({ client_id: clientId, auto_select: false, callback: ({ credential }) => callback.current(credential) });
    identity.renderButton(element.current, { type: "standard", theme: "outline", size: "large" });
  };
  return <>
    <Script src="https://accounts.google.com/gsi/client" onReady={render} onError={() => setFailed(true)} />
    {failed ? <Alert severity="warning">Google sign-in is unavailable. Try again or use your email.</Alert> : null}
    <Box ref={element} aria-label="Sign in with Google" sx={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.5 : 1 }} />
  </>;
}
