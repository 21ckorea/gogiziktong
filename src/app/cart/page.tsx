"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

    if (status === 'authenticated') {
      loadCart();
    }
  }, [status]);

  const total = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);

  if (status === 'loading') {
    return <main className="mx-auto max-w-3xl px-4 py-8">로딩 중...</main>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">장바구니</h1>
        <p className="text-sm text-gray-600">장바구니를 보려면 로그인이 필요합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">로그인하러 가기</Link>
        </Button>
      </main>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">장바구니</h1>
        <p className="text-sm text-gray-600">장바구니에 담긴 상품이 없습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/products">상품 보러가기</Link>
        </Button>
      </main>
    );
  }

  const handleChangeQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(item.id);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: item.productId, quantity }),
      });
      if (!res.ok) {
        alert('수량 변경에 실패했습니다.');
        return;
      }
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, quantity } : it)),
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    if (!confirm('이 상품을 장바구니에서 삭제하시겠습니까?')) return;
    setUpdatingId(item.id);
    try {
      const res = await fetch(`/api/cart/${item.productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        alert('삭제에 실패했습니다.');
        return;
      }
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">장바구니</h1>
      {loading ? (
        <p className="text-sm text-gray-600">불러오는 중...</p>
      ) : (
        <>
          <ul className="divide-y rounded-lg border bg-white">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product?.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {(item.product?.price ?? 0).toLocaleString()}원
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={updatingId === item.id}
                      onClick={() => handleChangeQuantity(item, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      disabled={updatingId === item.id}
                      onClick={() => handleChangeQuantity(item, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="ml-4"
                      disabled={updatingId === item.id}
                      onClick={() => handleRemoveItem(item)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-semibold">
                  {((item.product?.price ?? 0) * item.quantity).toLocaleString()}원
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-base font-semibold">총 결제 금액</p>
            <p className="text-xl font-bold">{total.toLocaleString()}원</p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/products">계속 쇼핑하기</Link>
            </Button>
            <Button asChild className="flex-1" variant="outline">
              <Link href="/checkout/cart">장바구니 결제하기</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
