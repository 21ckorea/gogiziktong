import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export class EmptyCartError extends Error {}
export class InvalidAddressError extends Error {}

export type CartItemWithProduct = Prisma.CartItemGetPayload<{ include: { product: true } }>;

export interface CartOrderContext {
  cartItems: CartItemWithProduct[];
  totalAmount: number;
  shippingAddressId?: string;
}

async function fetchCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
}

async function resolveShippingAddress(userId: string, shippingAddressId?: string) {
  if (!shippingAddressId) {
    return undefined;
  }

  const address = await prisma.address.findFirst({
    where: { id: shippingAddressId, userId },
  });

  if (!address) {
    throw new InvalidAddressError('올바르지 않은 배송지입니다.');
  }

  return address.id;
}

export async function loadCartOrderContext(userId: string, shippingAddressId?: string): Promise<CartOrderContext> {
  const cartItems = await fetchCartItems(userId);
  if (cartItems.length === 0) {
    throw new EmptyCartError('장바구니에 상품이 없습니다.');
  }

  const totalAmount = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingAddress = await resolveShippingAddress(userId, shippingAddressId);

  return {
    cartItems,
    totalAmount,
    shippingAddressId: shippingAddress,
  };
}

export async function persistOrderFromContext(userId: string, context: CartOrderContext) {
  const order = await prisma.order.create({
    data: {
      userId,
      status: 'PENDING',
      totalAmount: context.totalAmount,
      shippingAddressId: context.shippingAddressId,
      items: {
        create: context.cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price ?? 0,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.cartItem.deleteMany({ where: { userId } });

  return order;
}

export async function createOrderFromCart(userId: string, shippingAddressId?: string) {
  const context = await loadCartOrderContext(userId, shippingAddressId);
  const order = await persistOrderFromContext(userId, context);
  return { order, totalAmount: context.totalAmount };
}
