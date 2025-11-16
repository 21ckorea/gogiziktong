import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ParamsPromise = Promise<{ id: string }>;

// PATCH /api/addresses/[id] - update address or set as default
export async function PATCH(
  req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { label, receiverName, phone, postalCode, address1, address2, isDefault } = body;

  const existing = await prisma.address.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id },
    data: {
      label: label ?? existing.label,
      receiverName: receiverName ?? existing.receiverName,
      phone: phone ?? existing.phone,
      postalCode: postalCode ?? existing.postalCode,
      address1: address1 ?? existing.address1,
      address2: address2 ?? existing.address2,
      isDefault: typeof isDefault === 'boolean' ? isDefault : existing.isDefault,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/addresses/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  await prisma.address.deleteMany({
    where: { id, userId: session.user.id },
  });

  return new NextResponse(null, { status: 204 });
}
