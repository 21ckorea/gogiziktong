"use client";

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          imageUrl,
        }),
      });

      if (!res.ok) {
        console.error(await res.text());
        alert('상품 등록에 실패했습니다.');
        return;
      }

      const product = await res.json();
      router.push(`/products/${product.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return <main className="mx-auto max-w-2xl px-4 py-10">로딩 중...</main>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-4 py-10">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">상품 등록</h1>
          <p className="text-sm text-slate-600">
            상품을 등록하려면 로그인이 필요합니다.
          </p>
          <Button asChild className="mt-2 rounded-full px-6">
            <Link href="/auth/signin">로그인하러 가기</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">새 상품 등록</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          고기직통에 올릴 신선한 상품 정보를 입력해 주세요.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-200">상품명</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-rose-300 dark:focus:bg-slate-900"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예) [손돌이 정육점] 한우 등심"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-200">설명</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-rose-300 dark:focus:bg-slate-900"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="상품의 특징, 원산지, 중량 등을 간단히 적어주세요."
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-200">가격 (원)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:focus:border-rose-300 dark:focus:bg-slate-900"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={0}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-200">이미지 URL (임시)</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-rose-300 dark:focus:bg-slate-900"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="나중에 Vercel Blob 업로드로 교체 예정"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-rose-500 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 hover:shadow-md"
        >
          {loading ? '등록 중...' : '상품 등록하기'}
        </Button>
      </form>
    </main>
  );
}
