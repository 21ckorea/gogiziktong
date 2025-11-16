"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
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

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const qtyParam = searchParams?.get('qty');
  const quantity = Math.max(1, Number(qtyParam || '1') || 1);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.productId}`);
        if (!res.ok) {
          throw new Error('상품을 불러오지 못했습니다.');
        }
        const data = await res.json();
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }
    async function loadAddresses() {
      if (!session?.user) return;
      try {
        const res = await fetch('/api/addresses');
        if (!res.ok) return;
        const data: Address[] = await res.json();
        setAddresses(data);
        const defaultAddr = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch {
        // ignore
      }
    }
    loadProduct();
    loadAddresses();
  }, [params.productId, session?.user]);

  async function handleOrder() {
    if (!product) return;
    if (!session?.user) return;

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

      const totalAmount = product.price * quantity;

      IMP.request_pay(
        {
          pg: 'html5_inicis', // 테스트용 기본 PG사
          pay_method: 'card',
          name: product.name,
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
            // 결제 성공 시에만 주문 생성
            const res = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.id,
                quantity,
                shippingAddressId: selectedAddressId,
              }),
            });

            if (!res.ok) {
              alert('주문 생성에 실패했습니다.');
              setProcessing(false);
              return;
            }

            const order = await res.json();

            // 주문 상태를 결제완료로 업데이트 (선택)
            await fetch(`/api/orders/${order.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'PAID' }),
            });

            alert('결제와 주문이 정상적으로 완료되었습니다.');
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

  if (status === "loading" || loading) {
    return <p className="p-4">로딩 중...</p>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">주문하기</h1>
        <section className="mb-4 rounded-lg border bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold">배송지 선택</h2>
          {addresses.length === 0 ? (
            <p className="text-xs text-gray-600">
              등록된 배송지가 없습니다.{' '}
              <Link href="/addresses" className="text-blue-500 underline">
                배송지 추가하러 가기
              </Link>
            </p>
          ) : (
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
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
        <p className="text-sm text-gray-600">
          주문을 진행하려면 로그인이 필요합니다.
        </p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">로그인하러 가기</Link>
        </Button>
      </main>
    );
  }

  if (!product) {
    return <p className="p-4">상품을 찾을 수 없습니다.</p>;
  }

  return (
    <>
      {/* 아임포트 스크립트 (추후 IMP.request_pay 사용 시 필요) */}
      <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="afterInteractive" />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">주문하기</h1>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          {product.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="mb-3 h-48 w-full rounded-md object-cover"
            />
          )}
          <h2 className="text-lg font-semibold">{product.name}</h2>
          {product.description && (
            <p className="mt-1 text-sm text-gray-600">{product.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-700">
            단가: {product.price.toLocaleString()}원 (100g)
          </p>
          <p className="mt-1 text-sm text-gray-700">
            수량: {quantity}개 (총 {(quantity * 100).toLocaleString()}g)
          </p>
          <p className="mt-2 text-xl font-bold">
            총 결제 금액: {(product.price * quantity).toLocaleString()}원
          </p>
        </div>

        <section className="mt-6 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold">배송지 선택</h2>
          {addresses.length === 0 ? (
            <p className="mt-2 text-xs text-gray-600">
              등록된 배송지가 없습니다.{' '}
              <Link href="/addresses" className="text-blue-500 underline">
                배송지 추가하러 가기
              </Link>
            </p>
          ) : (
            <select
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
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
          className="mt-6 w-full"
          size="lg"
          disabled={processing}
          onClick={handleOrder}
        >
          {processing ? '결제 처리 중...' : '결제하고 주문하기'}
        </Button>
      </main>
    </>
  );
}
