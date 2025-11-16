import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/products - list products
export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

// POST /api/products - create product
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = await req.json();
  const { name, description, price, imageUrl } = body;

  if (!name || !price) {
    return NextResponse.json(
      { message: 'name 과 price 는 필수입니다.' },
      { status: 400 },
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      imageUrl: imageUrl ?? null,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
