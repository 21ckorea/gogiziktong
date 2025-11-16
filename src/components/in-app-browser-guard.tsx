"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const IN_APP_BROWSERS = [
  /KAKAOTALK/i,
  /NAVER/i,
  /Line/i,
  /FBAN/i,
  /FBAV/i,
  /Instagram/i,
];

function isInAppBrowser(userAgent: string) {
  return IN_APP_BROWSERS.some((pattern) => pattern.test(userAgent));
}

export function InAppBrowserGuard() {
  const [shouldBlock, setShouldBlock] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent || "";
    if (isInAppBrowser(ua)) {
      setShouldBlock(true);
    }
  }, []);

  const openInSystemBrowser = () => {
    if (typeof window === "undefined") return;
    const currentUrl = window.location.href;
    const ua = window.navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);

    if (isAndroid) {
      const sanitized = currentUrl.replace(/^https?:\/\//, "");
      const scheme = window.location.protocol.replace(":", "");
      const intent = `intent://${sanitized}#Intent;scheme=${scheme};package=com.android.chrome;end;`;
      window.location.href = intent;
    } else {
      window.open(currentUrl, "_blank");
    }
  };

  const instructions = useMemo(
    () => [
      "카카오톡·네이버 등 앱 내 브라우저에서는 Google 로그인이 차단됩니다.",
      "상단 ··· 메뉴에서 ‘기본 브라우저로 열기’를 누르거나, 아래 버튼으로 크롬/사파리에서 열어주세요.",
    ],
    [],
  );

  if (!shouldBlock) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/80 px-6 text-center text-white">
      <div className="space-y-4">
        <p className="text-lg font-semibold">보안 브라우저에서 열어 주세요</p>
        <ul className="space-y-2 text-sm leading-relaxed text-slate-100">
          {instructions.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <Button onClick={openInSystemBrowser} className="w-full rounded-full bg-white text-base font-semibold text-slate-900">
            크롬/사파리로 열기
          </Button>
          <button
            type="button"
            className="text-sm text-slate-200 underline"
            onClick={() => setShouldBlock(false)}
          >
            계속 이 브라우저에서 보기
          </button>
        </div>
      </div>
    </div>
  );
}
