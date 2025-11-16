"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 pl-2">
            <span className="inline-block rounded-full bg-gradient-to-r from-rose-100 to-amber-100 px-3 py-1 text-lg font-extrabold tracking-tight text-gray-900 shadow-sm">
              고기직통
            </span>
          </Link>
          {/* 데스크톱 메뉴 */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              홈
            </Link>
            <Link
              href="/products"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              상품 목록
            </Link>
            <Link
              href="/products/new"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              상품 등록
            </Link>
            <Link
              href="/orders"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              주문 내역
            </Link>
            <Link
              href="/addresses"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              배송지 관리
            </Link>
            <Link
              href="/cart"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              장바구니
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin/users"
                className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                회원 관리
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-sm md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            ☰
          </button>
          {session?.user ? (
            <div className="hidden items-center space-x-3 md:flex">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {session.user.name || session.user.email} 님
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {(session.user.role === 'ADMIN' ? '관리자' : '일반회원')}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="hidden md:block">
              <Button size="sm" asChild>
                <Link href="/auth/signin">로그인</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileOpen && (
        <div className="border-b bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              홈
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              상품 목록
            </Link>
            <Link
              href="/products/new"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              상품 등록
            </Link>
            <Link
              href="/orders"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              주문 내역
            </Link>
            <Link
              href="/addresses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              배송지 관리
            </Link>
            <Link
              href="/cart"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              onClick={() => setMobileOpen(false)}
            >
              장바구니
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin/users"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileOpen(false)}
              >
                회원 관리
              </Link>
            )}
            <div className="mt-2 border-t pt-2">
              {session?.user ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {session.user.name || session.user.email} 님
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                  >
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  asChild
                  onClick={() => setMobileOpen(false)}
                >
                  <Link href="/auth/signin">로그인</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
