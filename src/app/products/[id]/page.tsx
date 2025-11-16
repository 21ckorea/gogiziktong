import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductActionBar } from '@/components/product-action-bar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isOwner = !!session?.user && product.ownerId === session.user.id;
  const isAdmin = !!session?.user && session.user.role === 'ADMIN';
  const canEdit = isOwner || isAdmin;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-900 dark:text-slate-100">
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {product.name}
        </h1>
        {product.description && (
          <p className="text-base text-slate-700 dark:text-slate-200">{product.description}</p>
        )}
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="mb-4 h-80 w-full rounded-xl object-cover"
          />
        )}
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">
          {product.price.toLocaleString()}원
          <span className="ml-1 text-base font-normal text-slate-500 dark:text-slate-300"> / 100g</span>
        </p>
      </section>

      <div className="mt-6 text-slate-900 dark:text-slate-100">
        <ProductActionBar productId={product.id} canEdit={canEdit} />
      </div>
    </main>
  );
}
