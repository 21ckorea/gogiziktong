import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
          신선한 고기를 직접 만나보세요
        </h1>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          생산자에서 소비자로 직접 연결되는 신선한 정육 직거래 플랫폼
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/products">상품 보러가기</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/about">자세히 알아보기</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
