"use client";

import { useState } from "react";
import Link from "next/link";

export default function Logo() {
  const [imgOk, setImgOk] = useState(true);
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="RRcollections home">
      {imgOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="RRcollections"
          className="h-11 w-auto sm:h-12"
          onError={() => setImgOk(false)}
        />
      )}
      <span className="font-display text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
        <span className="text-gold">RR</span>
        <span className="text-brand">collections</span>
      </span>
    </Link>
  );
}
