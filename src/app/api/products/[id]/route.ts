import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type ParamsPromise = Promise<{ id: string }>;

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const isOwner = existing.ownerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const body = await req.json();
  const { name, description, price, imageUrl } = body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description: description ?? null,
      price: price !== undefined ? Number(price) : undefined,
      imageUrl: imageUrl ?? null,
    },
  });

  return NextResponse.json(product);
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: ParamsPromise },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const isOwner = existing.ownerId === session.user.id;
  const isAdmin = session.user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  await prisma.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
