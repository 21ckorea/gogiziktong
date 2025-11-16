import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

type ParamsPromise = Promise<{ productId: string }>;

// DELETE /api/cart/[productId] - remove item from current user's cart
export async function DELETE(
  _req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { productId } = await params;

  await prisma.cartItem.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return new NextResponse(null, { status: 204 });
}
