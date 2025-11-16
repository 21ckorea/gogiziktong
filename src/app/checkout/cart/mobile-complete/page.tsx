
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function MobileCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('결제 결과를 확인하고 있습니다.');

  useEffect(() => {
    async function verifyPayment() {
      const impUid = searchParams?.get('imp_uid') ?? undefined;
      const merchantUid = searchParams?.get('merchant_uid') ?? undefined;
      const successParam = searchParams?.get('success');
      const errorMsg = searchParams?.get('error_msg');

      if (!impUid) {
        setStatus('error');
        setMessage('결제 식별자를 확인할 수 없습니다.');
        return;
      }

      if (successParam && successParam !== 'true') {
        setStatus('error');
        setMessage(errorMsg || '결제가 취소되었거나 실패했습니다.');
        return;
      }

      let shippingAddressId: string | undefined;
      try {
        shippingAddressId = window.sessionStorage.getItem('cartCheckoutShippingAddressId') ?? undefined;
        window.sessionStorage.removeItem('cartCheckoutShippingAddressId');
      } catch {
        // ignore storage issues
      }

      try {
        const res = await fetch('/api/checkout/cart/mobile-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ impUid, merchantUid, shippingAddressId }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || '모바일 결제 검증에 실패했습니다.');
        }

        setStatus('success');
        setMessage('결제가 정상적으로 완료되었습니다. 주문 내역으로 이동합니다.');
        setTimeout(() => {
          router.replace('/orders');
        }, 1200);
      } catch (error) {
        console.error('[mobile-complete] verification failed', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '결제 검증 중 오류가 발생했습니다.');
      }
    }

    verifyPayment();
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">모바일 결제 처리</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        {status === 'error' && (
          <Button
            className="w-full rounded-full"
            variant="outline"
            onClick={() => router.replace('/cart')}
          >
            장바구니로 돌아가기
          </Button>
        )}
        {status === 'success' && (
          <p className="text-xs text-slate-500">잠시 후 자동으로 이동하지 않으면 주문 내역에서 확인해 주세요.</p>
        )}
      </div>
    </main>
  );
}

export default function CartMobileCompletePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            결제 결과를 확인하고 있습니다...
          </div>
        </main>
      }
    >
      <MobileCompleteInner />
    </Suspense>
  );
}
