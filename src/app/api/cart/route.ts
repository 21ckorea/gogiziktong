import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/cart - current user's cart items
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(items);
}

// POST /api/cart - add or update item in cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { productId, quantity } = body as { productId?: string; quantity?: number };

  if (!productId) {
    return NextResponse.json({ message: 'productId는 필수입니다.' }, { status: 400 });
  }

  const qty = quantity && quantity > 0 ? quantity : 1;

  // upsert: 이미 있으면 수량만 변경, 없으면 새로 생성
  const item = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    create: {
      userId: session.user.id,
      productId,
      quantity: qty,
    },
    update: {
      quantity: qty,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
