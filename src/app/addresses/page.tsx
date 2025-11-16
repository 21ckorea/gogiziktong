"use client";

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState('집');
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // 다음 우편번호 스크립트 로드 여부
  const [postcodeLoaded, setPostcodeLoaded] = useState(false);

  useEffect(() => {
    // 이미 로드되어 있다면 다시 로드하지 않음
    if (typeof window === 'undefined') return;
    if ((window as any).daum?.Postcode) {
      setPostcodeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => {
      setPostcodeLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // 스크립트는 한 번만 로드되면 되므로 제거는 하지 않음
    };
  }, []);

  const handleOpenPostcode = () => {
    if (!(window as any).daum?.Postcode) {
      alert('우편번호 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    new (window as any).daum.Postcode({
      oncomplete: function (data: any) {
        const addr = data.roadAddress || data.jibunAddress;
        setPostalCode(data.zonecode || '');
        setAddress1(addr || '');
      },
    }).open();
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/addresses');
        if (!res.ok) {
          setAddresses([]);
          return;
        }
        const data: Address[] = await res.json();
        setAddresses(data);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      load();
    }
  }, [status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          receiverName,
          phone,
          postalCode,
          address1,
          address2,
          isDefault,
        }),
      });
      if (!res.ok) {
        alert('배송지 등록에 실패했습니다.');
        return;
      }
      const created: Address = await res.json();
      setAddresses((prev) => {
        // 기본 배송지로 설정한 경우, 기존 목록에서 isDefault를 해제하고 새 주소를 기본으로 설정
        if (created.isDefault) {
          return [
            created,
            ...prev.map((a) => ({ ...a, isDefault: false })),
          ];
        }
        // 기본 아님: 가장 최근에 추가된 주소가 위에 보이도록 앞에 추가
        return [created, ...prev];
      });
      setLabel('집');
      setReceiverName('');
      setPhone('');
      setPostalCode('');
      setAddress1('');
      setAddress2('');
      setIsDefault(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('이 배송지를 삭제하시겠습니까?')) return;
    await fetch(`/api/addresses/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    router.refresh();
  }

  if (status === 'loading') {
    return <main className="mx-auto max-w-3xl px-4 py-8">로딩 중...</main>;
  }

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">배송지 관리</h1>
        <p className="text-sm text-gray-600">배송지를 관리하려면 로그인이 필요합니다.</p>
        <Button asChild className="mt-4">
          <Link href="/auth/signin">로그인하러 가기</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">배송지 관리</h1>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3 rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">새 배송지 추가</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-700">라벨 (집/회사)</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="집"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">수령인</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">연락처</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">우편번호</label>
            <div className="mt-1 flex gap-2">
              <input
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenPostcode}
                disabled={!postcodeLoaded}
              >
                {postcodeLoaded ? '우편번호 찾기' : '로딩 중'}
              </Button>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">주소</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="도로명/지번 주소"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">상세 주소</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={address2}
            onChange={(e) => setAddress2(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="isDefault"
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label htmlFor="isDefault" className="text-xs text-gray-700">
            기본 배송지로 설정
          </label>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? '저장 중...' : '배송지 추가'}
        </Button>
      </form>

      <h2 className="mb-2 text-lg font-semibold">내 배송지</h2>
      {loading ? (
        <p className="text-sm text-gray-600">불러오는 중...</p>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-600">등록된 배송지가 없습니다.</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr) => (
            <li key={addr.id} className="flex items-start justify-between rounded-lg border bg-white p-4">
              <div>
                <p className="text-sm font-semibold">
                  [{addr.label}] {addr.receiverName}{' '}
                  {addr.isDefault && (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      기본 배송지
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-600">{addr.phone}</p>
                <p className="mt-1 text-xs text-gray-600">
                  ({addr.postalCode}) {addr.address1} {addr.address2}
                </p>
              </div>
              <div className="flex flex-col gap-2 text-xs">
                {!addr.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    기본으로
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(addr.id)}
                >
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
