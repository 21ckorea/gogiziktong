import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/addresses - list current user's addresses
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(addresses);
}

// POST /api/addresses - create new address
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { label, receiverName, phone, postalCode, address1, address2, isDefault } = body;

  if (!label || !receiverName || !phone || !postalCode || !address1) {
    return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }

  // 새 기본 배송지를 추가하는 경우, 기존 기본값 해제
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label,
      receiverName,
      phone,
      postalCode,
      address1,
      address2: address2 ?? '',
      isDefault: !!isDefault,
    },
  });

  return NextResponse.json(address, { status: 201 });
}
