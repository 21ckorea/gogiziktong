import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type AdminUser = Awaited<ReturnType<typeof fetchUsers>>[number];

async function fetchUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-10">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">회원 목록</h1>
          <p className="text-sm text-slate-600">회원 관리를 보려면 로그인이 필요합니다.</p>
        </div>
      </main>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-4 py-10">
        <div className="space-y-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">회원 목록</h1>
          <p className="text-sm text-slate-600">이 페이지는 관리자만 볼 수 있습니다.</p>
        </div>
      </main>
    );
  }

  const users = await fetchUsers();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-4 space-y-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">회원 목록</h1>
        <p className="text-sm text-slate-500">
          총 {users.length}명의 회원이 고기직통에 가입되어 있습니다.
        </p>
      </div>

      <div className="space-y-3">
        {users.map((user: AdminUser) => (
          <div
            key={user.id}
            className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/90 p-4 text-sm shadow-sm transition hover:-translate-y-[1px] hover:shadow-md md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{user.name ?? '-'}</p>
              <p className="text-xs text-slate-500">{user.email ?? '-'}</p>
            </div>
            <div className="flex flex-col items-start gap-1 text-xs text-slate-500 md:items-end">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  user.role === 'ADMIN'
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {user.role === 'ADMIN' ? '관리자' : '일반회원'}
              </span>
              <span>가입일 {new Date(user.createdAt).toLocaleString('ko-KR')}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
