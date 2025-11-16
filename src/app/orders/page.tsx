import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, shippingAddress: true },
  });
}

type OrderWithRelations = Awaited<ReturnType<typeof getOrders>>[number];
type OrderItemWithProduct = OrderWithRelations['items'][number];

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col justify-center px-4 py-10">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">주문 내역</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            주문 내역을 확인하려면 로그인이 필요합니다.
          </p>
          <Button asChild className="mt-2 rounded-full px-6">
            <Link href="/auth/signin">로그인하러 가기</Link>
          </Button>
        </div>
      </main>
    );
  }

  const orders = await getOrders(session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">주문 내역</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">최근 주문들을 한눈에 확인해 보세요.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          <p className="mb-2 text-base font-medium text-slate-700 dark:text-slate-100">아직 주문이 없습니다.</p>
          <p className="mb-4">맛있는 고기를 장바구니에 담고 첫 주문을 진행해 보세요.</p>
          <Button asChild className="rounded-full px-6">
            <Link href="/products">상품 보러가기</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order: OrderWithRelations) => (
            <li
              key={order.id}
              className="rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-slate-500">
                  주문일시 {new Date(order.createdAt).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    주문번호 {order.id.slice(0, 8)}...
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status === 'PAID' ? '결제완료' : order.status}
                  </span>
                </div>
              </div>

              {order.shippingAddress && (
                <p className="mt-2 text-xs text-slate-600">
                  배송지: [{order.shippingAddress.label}] {order.shippingAddress.receiverName} /{' '}
                  {order.shippingAddress.address1}
                </p>
              )}

              <div className="mt-3 flex items-end justify-between gap-4">
                <ul className="flex-1 space-y-1 text-sm text-slate-700">
                  {order.items.map((item: OrderItemWithProduct) => (
                    <li key={item.id}>
                      {item.product?.name} x {item.quantity}개 ·{' '}
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString()}원
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-right text-base font-semibold text-slate-900">
                  총 {order.totalAmount.toLocaleString()}원
                </p>
              </div>

              <Link
                href={`/api/orders/${order.id}`}
                className="mt-3 inline-block text-xs text-slate-400 underline underline-offset-4"
              >
                API 응답 보기
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
