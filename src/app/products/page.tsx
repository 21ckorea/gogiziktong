import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

type ProductWithMeta = Awaited<ReturnType<typeof getProducts>>[number];

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">상품 목록</h1>
          <p className="mt-1 text-sm text-slate-500">산지의 신선한 고기를 한눈에 둘러보세요.</p>
        </div>
        <Button asChild className="rounded-full px-5 text-sm">
          <Link href="/products/new">상품 등록</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm text-slate-500">
          <p className="mb-2 text-base font-medium text-slate-700">등록된 상품이 없습니다.</p>
          <p className="mb-4">첫 상품을 등록해 고기직통의 판매를 시작해 보세요.</p>
          <Button asChild className="rounded-full px-6">
            <Link href="/products/new">첫 상품 등록하기</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {products.map((product: ProductWithMeta) => (
            <li
              key={product.id}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="mb-3 h-40 w-full rounded-xl object-cover"
                />
              )}
              <h2 className="truncate text-sm font-semibold text-slate-900 md:text-base">
                {product.name}
              </h2>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs text-slate-500 md:text-sm">
                  {product.description}
                </p>
              )}
              <p className="mt-2 text-sm font-bold text-slate-900">
                {product.price.toLocaleString()}원
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-3 w-full rounded-full border-slate-200 text-xs text-slate-800 group-hover:border-rose-300 group-hover:text-rose-600"
              >
                <Link href={`/products/${product.id}`}>상세 보기</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
