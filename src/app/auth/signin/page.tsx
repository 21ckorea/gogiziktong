'use client';

import { Suspense } from 'react';
import { SignInInner } from './SignInInner';

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}