import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/orders/[id]
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } },
) {
  const { params } = context;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.json(order);
}

// PATCH /api/orders/[id] - 주문 상태 업데이트 (예: 결제 성공 후 PAID 처리)
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { params } = context;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { status } = body as { status?: string };

  if (!status) {
    return NextResponse.json({ message: 'status 는 필수입니다.' }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(order);
}
