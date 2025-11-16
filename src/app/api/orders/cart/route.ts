import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/orders/cart - create order from current user's cart and clear cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const shippingAddressId = (body as { shippingAddressId?: string }).shippingAddressId;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  type CartItemWithProduct = (typeof cartItems)[number];

  if (cartItems.length === 0) {
    return NextResponse.json({ message: '장바구니에 상품이 없습니다.' }, { status: 400 });
  }

  const totalAmount = cartItems.reduce((sum: number, item: CartItemWithProduct) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  let shippingAddressIdToUse: string | undefined;
  if (shippingAddressId) {
    const address = await prisma.address.findFirst({
      where: { id: shippingAddressId, userId: session.user.id },
    });
    if (!address) {
      return NextResponse.json({ message: '올바르지 않은 배송지입니다.' }, { status: 400 });
    }
    shippingAddressIdToUse = address.id;
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: 'PENDING',
      totalAmount,
      shippingAddressId: shippingAddressIdToUse,
      items: {
        create: cartItems.map((item: CartItemWithProduct) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price ?? 0,
        })),
      },
    },
    include: { items: true },
  });

  // 장바구니 비우기
  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json(order, { status: 201 });
}
