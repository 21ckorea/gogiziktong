import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AutoVideo } from '@/components/auto-video';

export const dynamic = 'force-dynamic';

const firePitHighlight = {
  title: '오늘 밤, 화로 위에서 춤추는 스테이크',
  description: '직화로 겉은 바삭하게, 속은 촉촉하게 익힌 한우 채끝. 불맛이 고스란히 전해지는 라이브 세션을 감상해 보세요.',
  checklist: ['90초 시어링 테크닉', '짭조름한 레드와인 버터 글레이즈', '셰프의 플레이팅 팁'],
  video: 'https://storage.googleapis.com/coverr-main/mp4/Grilling.mp4',
  poster:
    'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=1',
};

type MediaStory = {
  id: string;
  type: 'video' | 'image';
  media: string;
  poster?: string;
  badge?: string;
  title: string;
  description: string;
  link: string;
};

const cookingStories: MediaStory[] = [
  {
    id: 'live-fire-galbi',
    type: 'video',
    media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerGuns.mp4',
    poster:
      'https://images.pexels.com/photos/3756523/pexels-photo-3756523.jpeg?auto=compress&cs=tinysrgb&w=900&h=1200&dpr=1',
    badge: 'LIVE',
    title: '직화 갈비 불쇼',
    description: '농후한 양념과 숯불의 조화, 불꽃 위에서 완성되는 풍미를 영상으로 확인해 보세요.',
    link: '/products?tag=galbi',
  },
  {
    id: 'ssam-night',
    type: 'image',
    media:
      'https://images.pexels.com/photos/66639/pexels-photo-66639.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1',
    badge: 'New',
    title: '쌈 한 장에 담은 캠핑 무드',
    description: '숯불 삼겹-쌈 조합에 어울리는 채소 페어링을 소개합니다.',
    link: '/products?tag=pork-belly',
  },
  {
    id: 'bbq-platter',
    type: 'image',
    media:
      'https://images.pexels.com/photos/5908047/pexels-photo-5908047.jpeg?auto=compress&cs=tinysrgb&w=700&h=900&dpr=1',
    badge: 'Guide',
    title: 'BBQ 플래터 세팅',
    description: '토치로 마무리하는 초간단 글레이즈와 사이드 구성을 함께 만나보세요.',
    link: '/products?tag=bbq',
  },
];

export default async function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 text-slate-900 dark:text-slate-100">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-2xl bg-black lg:col-span-3">
            <AutoVideo
              className="h-full w-full object-cover"
              src={firePitHighlight.video}
              poster={firePitHighlight.poster}
              loop
              controls
            />
          </div>
          <div className="flex flex-col justify-between lg:col-span-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-rose-500">오늘의 화로</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{firePitHighlight.title}</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-200">{firePitHighlight.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-100">
                {firePitHighlight.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/products?tag=prime-beef">추천 부위 주문하기</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/blog?topic=steak">레시피 자세히 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-rose-500">Cook & Inspire</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">불향 플레이리스트</h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-300">매주 새로운 영상과 이미지가 업데이트됩니다.</span>
        </div>
        <div className="grid auto-rows-[220px] gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cookingStories.map((story, index) => (
            <article
              key={story.id}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 ${
                index === 0 ? 'md:col-span-2 md:row-span-2 auto-rows-[300px]' : ''
              }`}
            >
              {story.type === 'video' ? (
                <AutoVideo className="h-full w-full object-cover" src={story.media} poster={story.poster} loop />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={story.media} alt={story.title} className="h-full w-full object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                  <span className="rounded-full bg-rose-500/90 px-2 py-0.5 text-[0.65rem]">
                    {story.badge ?? 'Story'}
                  </span>
                  <span className="opacity-80">영상 · 이미지</span>
                </div>
                <h3 className="text-lg font-bold">{story.title}</h3>
                <p className="text-sm text-white/80">{story.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-200">
                  <Link href={story.link} className="pointer-events-auto flex items-center gap-1 underline-offset-4 hover:underline">
                    자세히 보기 →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </main>
  );
}
