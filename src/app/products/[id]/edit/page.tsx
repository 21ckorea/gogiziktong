'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) {
          throw new Error('상품을 불러오지 못했습니다.');
        }
        const data: Product = await res.json();
        setProduct(data);
        setName(data.name);
        setDescription(data.description ?? '');
        setPrice(String(data.price));
        setImageUrl(data.imageUrl ?? '');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          imageUrl,
        }),
      });

      if (!res.ok) {
        alert('상품 수정에 실패했습니다.');
        return;
      }

      const updated = await res.json();
      router.push(`/products/${updated.id}`);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return <main className="mx-auto max-w-xl px-4 py-8">로딩 중...</main>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">상품 수정</h1>
        <p className="text-sm text-gray-600">상품을 수정하려면 로그인이 필요합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">로그인하러 가기</Link>
        </Button>
      </main>
    );
  }

  if (!product) {
    return <main className="mx-auto max-w-xl px-4 py-8">상품을 찾을 수 없습니다.</main>;
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">상품 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">상품명</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">설명</label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">가격 (원)</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">이미지 URL (임시)</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="나중에 Vercel Blob 업로드로 교체 예정"
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? '수정 중...' : '수정 완료'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            취소
          </Button>
        </div>
      </form>
    </main>
  );
}
