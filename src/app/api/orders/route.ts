import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/orders - 현재 사용자 주문 목록
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, shippingAddress: true },
  });

  return NextResponse.json(orders);
}

// POST /api/orders - 단일 상품 주문 생성 (임시: 결제 없이 바로 PAID 처리 가능)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { productId, quantity = 1, shippingAddressId } = body as {
    productId?: string;
    quantity?: number;
    shippingAddressId?: string;
  };

  if (!productId || quantity <= 0) {
    return NextResponse.json(
      { message: 'productId 와 quantity (> 0) 는 필수입니다.' },
      { status: 400 },
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return NextResponse.json({ message: '상품을 찾을 수 없습니다.' }, { status: 404 });
  }

  const totalAmount = product.price * quantity;

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
        create: [
          {
            productId: product.id,
            quantity,
            price: product.price,
          },
        ],
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}
