import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrderFromCart, EmptyCartError, InvalidAddressError } from '@/lib/order-service';

// POST /api/orders/cart - create order from current user's cart and clear cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const shippingAddressId = (body as { shippingAddressId?: string }).shippingAddressId;

  try {
    const { order } = await createOrderFromCart(session.user.id, shippingAddressId);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof InvalidAddressError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('[orders/cart] Failed to create order', error);
    return NextResponse.json({ message: '주문 생성에 실패했습니다.' }, { status: 500 });
  }
}
