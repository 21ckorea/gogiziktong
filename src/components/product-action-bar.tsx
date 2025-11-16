"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/add-to-cart-button';

interface ProductActionBarProps {
  productId: string;
  canEdit: boolean;
}

export function ProductActionBar({ productId, canEdit }: ProductActionBarProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);

  const qty = quantity > 0 ? quantity : 1;

  function handleOrderClick() {
    router.push(`/checkout/${productId}?qty=${qty}`);
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">수량 (100g 단위)</label>
        <input
          type="number"
          min={1}
          className="w-24 rounded-md border px-2 py-1 text-sm"
          value={quantity}
          onChange={(e) => {
            const v = Number(e.target.value || '1');
            setQuantity(v > 0 ? v : 1);
          }}
        />
        <span className="text-xs text-gray-500">예: 1kg → 10개</span>
      </div>

      <div className="flex gap-3">
        <Button className="flex-1" onClick={handleOrderClick}>
          주문하기
        </Button>
        <AddToCartButton productId={productId} quantity={qty} />
        {canEdit && (
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/products/${productId}/edit`}>수정하기</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
