"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CartItemProduct {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartItemProduct | null;
}

interface Address {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    IMP?: any;
  }
}

export default function CartCheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      try {
        const res = await fetch('/api/cart');
        if (res.status === 401) {
          setItems([]);
          return;
        }
        if (!res.ok) {
          throw new Error('장바구니를 불러오지 못했습니다.');
        }
        const data: CartItem[] = await res.json();
        setItems(data);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
    async function loadAddresses() {
      if (!session?.user) return;
      try {
        const res = await fetch('/api/addresses');
        if (!res.ok) return;
        const data: Address[] = await res.json();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch {
        // ignore
      }
    }

    loadAddresses();
  }, [session?.user]);

  const totalAmount = items.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  async function handleCheckout() {
    if (!session?.user) return;
    if (items.length === 0) {
      alert('장바구니에 상품이 없습니다.');
      return;
    }

     if (!selectedAddressId) {
       alert('배송지를 먼저 선택하거나 등록해 주세요.');
       return;
     }

    const merchantId = process.env.NEXT_PUBLIC_IAMPORT_MERCHANT_ID;
    if (!merchantId) {
      alert('아임포트 가맹점 코드가 설정되지 않았습니다. NEXT_PUBLIC_IAMPORT_MERCHANT_ID 환경변수를 확인해주세요.');
      return;
    }

    const IMP = window.IMP;
    if (!IMP) {
      alert('결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setProcessing(true);
    try {
      IMP.init(merchantId);

      const productNames = items.map((i) => i.product?.name).filter(Boolean).join(', ');

      IMP.request_pay(
        {
          pg: 'html5_inicis',
          pay_method: 'card',
          name: productNames || '장바구니 결제',
          amount: totalAmount,
          buyer_email: session.user.email,
          buyer_name: session.user.name,
        },
        async (rsp: any) => {
          if (!rsp.success) {
            alert('결제가 취소되었거나 실패했습니다. \n사유: ' + (rsp.error_msg || '알 수 없는 오류'));
            setProcessing(false);
            return;
          }

          try {
            // 결제 성공 시 장바구니 기반 주문 생성
            const res = await fetch('/api/orders/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shippingAddressId: selectedAddressId }),
            });

            if (!res.ok) {
              alert('장바구니 주문 생성에 실패했습니다.');
              setProcessing(false);
              return;
            }

            const order = await res.json();

            // 주문 상태를 결제완료로 업데이트
            await fetch(`/api/orders/${order.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'PAID' }),
            });

            alert('장바구니 결제와 주문이 정상적으로 완료되었습니다.');
            router.push('/orders');
          } finally {
            setProcessing(false);
          }
        },
      );
    } catch (e) {
      console.error(e);
      alert('결제 처리 중 오류가 발생했습니다.');
      setProcessing(false);
    }
  }

  if (status === 'loading' || loading) {
    return <main className="mx-auto max-w-3xl px-4 py-8">로딩 중...</main>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">장바구니 결제</h1>
        <p className="text-sm text-gray-600">결제를 진행하려면 로그인이 필요합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">로그인하러 가기</Link>
        </Button>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">장바구니 결제</h1>
        <p className="text-sm text-gray-600">장바구니에 담긴 상품이 없습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/products">상품 보러가기</Link>
        </Button>
      </main>
    );
  }

  return (
    <>
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-50">장바구니 결제</h1>
        <ul className="mb-4 divide-y rounded-2xl border border-slate-100 bg-white/90 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/70">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">{item.product?.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-300">
                  {item.quantity}개 · {(item.product?.price ?? 0).toLocaleString()}원
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {((item.product?.price ?? 0) * item.quantity).toLocaleString()}원
              </p>
            </li>
          ))}
        </ul>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">총 결제 금액</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalAmount.toLocaleString()}원</p>
        </div>

        <section className="mb-6 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">배송지 선택</h2>
          {addresses.length === 0 ? (
            <p className="mt-2 text-xs text-gray-600 dark:text-slate-300">
              등록된 배송지가 없습니다.{' '}
              <Link href="/addresses" className="text-blue-500 underline">
                배송지 추가하러 가기
              </Link>
            </p>
          ) : (
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  [{addr.label}] {addr.receiverName} / {addr.address1}
                </option>
              ))}
            </select>
          )}
        </section>

        <Button
          className="w-full rounded-full text-base font-semibold"
          size="lg"
          disabled={processing}
          onClick={handleCheckout}
        >
          {processing ? '결제 처리 중...' : '장바구니 전체 결제하기'}
        </Button>
      </main>
    </>
  );
}
