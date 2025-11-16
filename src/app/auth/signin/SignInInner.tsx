'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 via-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">고기직통</h1>
          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">로그인</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            구글 계정으로 간편하게 로그인하고 서비스를 이용해 보세요.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            className="flex w-full items-center justify-center rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-600"
            onClick={() => signIn('google', { callbackUrl })}
          >
            <Icons.google className="mr-2 h-4 w-4" />
            구글로 로그인
          </Button>

          <Button
            variant="outline"
            className="flex w-full items-center justify-center rounded-full border-dashed border-slate-200 py-2 text-sm text-slate-400 opacity-70"
            disabled
          >
            <Icons.naver className="mr-2 h-4 w-4" />
            네이버 로그인 (준비 중)
          </Button>

          <Button
            variant="outline"
            className="flex w-full items-center justify-center rounded-full border-dashed border-slate-200 py-2 text-sm text-slate-400 opacity-70"
            disabled
          >
            <Icons.kakao className="mr-2 h-4 w-4" />
            카카오 로그인 (준비 중)
          </Button>
        </div>
      </div>
    </div>
  );
}
