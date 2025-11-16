import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchPaymentByImpUid } from '@/lib/iamport';
import {
  EmptyCartError,
  InvalidAddressError,
  loadCartOrderContext,
  persistOrderFromContext,
} from '@/lib/order-service';
import { prisma } from '@/lib/prisma';

interface Payload {
  impUid?: string;
  merchantUid?: string;
  shippingAddressId?: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Payload;
  const { impUid, merchantUid, shippingAddressId } = body;

  if (!impUid) {
    return NextResponse.json({ message: '결제 식별자가 없습니다.' }, { status: 400 });
  }

  try {
    const payment = await fetchPaymentByImpUid(impUid);

    if (payment.status !== 'paid') {
      return NextResponse.json({ message: '결제가 완료되지 않았습니다.' }, { status: 400 });
    }

    const context = await loadCartOrderContext(session.user.id, shippingAddressId);

    if (Math.round(payment.amount) !== context.totalAmount) {
      return NextResponse.json({ message: '결제 금액과 주문 금액이 일치하지 않습니다.' }, { status: 400 });
    }

    const pendingOrder = await persistOrderFromContext(session.user.id, context);

    const order = await prisma.order.update({
      where: { id: pendingOrder.id },
      data: {
        status: 'PAID',
        // merchant/payment identifiers could be persisted later if schema supports it
      },
      include: { items: { include: { product: true } }, shippingAddress: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof InvalidAddressError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('[checkout/cart/mobile-complete] verification failed', { impUid, merchantUid }, error);
    return NextResponse.json({ message: '모바일 결제 검증에 실패했습니다.' }, { status: 500 });
  }
}
