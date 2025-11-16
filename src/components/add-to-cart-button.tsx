"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
}

export function AddToCartButton({ productId, quantity = 1 }: AddToCartButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === 'loading') {
    return (
      <Button disabled className="flex-1">
        확인 중...
      </Button>
    );
  }

  if (!session?.user) {
    return (
      <Button asChild variant="outline" className="flex-1">
        <Link href="/auth/signin">로그인 후 담기</Link>
      </Button>
    );
  }

  async function handleAdd() {
    try {
      setLoading(true);
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!res.ok) {
        alert('장바구니 담기에 실패했습니다.');
        return;
      }

      alert('장바구니에 담았습니다.');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="flex-1"
      disabled={loading}
      onClick={handleAdd}
    >
      {loading ? '담는 중...' : '장바구니 담기'}
    </Button>
  );
}
