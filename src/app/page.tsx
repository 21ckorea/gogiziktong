import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getLatestProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  });
}

export default async function Home() {
  const products = await getLatestProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8">
      <section className="rounded-2xl bg-gradient-to-r from-red-100 via-orange-50 to-amber-100 p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold tracking-tight text-red-900 sm:text-4xl">
          산지에서 식탁까지, 고기직통
        </h1>
        <p className="mt-3 max-w-xl text-sm text-red-900/80 sm:text-base">
          믿을 수 있는 생산자와 직접 연결된 신선한 고기를 합리적인 가격으로 만나보세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/products">상품 보러가기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products/new">내 상품 등록하기</Link>
          </Button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">신규 등록 상품</h2>
          <Link
            href="/products"
            className="text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            전체 보기
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-gray-500">아직 등록된 상품이 없습니다. 첫 상품을 등록해 보세요!</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                {product.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="mb-3 h-32 w-full rounded-md object-cover"
                  />
                )}
                <h3 className="truncate text-sm font-semibold">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                    {product.description}
                  </p>
                )}
                <p className="mt-2 text-sm font-bold">
                  {product.price.toLocaleString()}원
                </p>
                <Button asChild variant="outline" className="mt-3 w-full text-xs">
                  <Link href={`/products/${product.id}`}>상세 보기</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
