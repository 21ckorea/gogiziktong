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
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-sm backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">고기직통</h1>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">로그인</h2>
          <p className="mt-2 text-sm text-slate-500">
            구글 계정으로 간편하게 로그인하고 서비스를 이용해 보세요.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            variant="outline"
            className="flex w-full items-center justify-center rounded-full border-slate-200 py-2 text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50"
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
