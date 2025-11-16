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
    <div className="mt-6 space-y-3 text-slate-900 dark:text-slate-50">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-900 dark:text-white">수량 (100g 단위)</label>
        <input
          type="number"
          min={1}
          className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-900 shadow-sm focus-visible:border-rose-400 focus-visible:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          value={quantity}
          onChange={(e) => {
            const v = Number(e.target.value || '1');
            setQuantity(v > 0 ? v : 1);
          }}
        />
        <span className="text-xs text-slate-500 dark:text-slate-300">예: 1kg → 10개</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="flex-1 rounded-full text-base font-semibold" onClick={handleOrderClick}>
          주문하기
        </Button>
        <AddToCartButton productId={productId} quantity={qty} />
        {canEdit && (
          <Button asChild variant="outline" className="flex-1 rounded-full text-base font-semibold">
            <Link href={`/products/${productId}/edit`}>수정하기</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
