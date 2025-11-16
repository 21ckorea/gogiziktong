const IAMPORT_API_KEY = process.env.IAMPORT_API_KEY;
const IAMPORT_API_SECRET = process.env.IAMPORT_API_SECRET;

if (!IAMPORT_API_KEY || !IAMPORT_API_SECRET) {
  console.warn('[Iamport] IAMPORT_API_KEY or IAMPORT_API_SECRET is not set. Payment verification will fail.');
}

interface IamportTokenResponse {
  code: number;
  message?: string;
  response?: {
    access_token: string;
    expired_at: number;
    now: number;
  };
}

interface IamportPaymentResponse {
  code: number;
  message?: string;
  response?: {
    imp_uid: string;
    merchant_uid: string;
    status: string;
    amount: number;
    buyer_email?: string;
    buyer_name?: string;
    paid_at?: number;
  };
}

async function getAccessToken() {
  if (!IAMPORT_API_KEY || !IAMPORT_API_SECRET) {
    throw new Error('아임포트 서버 검증을 위한 API Key/Secret이 설정되지 않았습니다.');
  }

  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key: IAMPORT_API_KEY, imp_secret: IAMPORT_API_SECRET }),
    cache: 'no-store',
  });

  const data = (await res.json()) as IamportTokenResponse;
  if (data.code !== 0 || !data.response) {
    throw new Error(data.message || '아임포트 액세스 토큰 발급에 실패했습니다.');
  }

  return data.response.access_token;
}

export async function fetchPaymentByImpUid(impUid: string) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.iamport.kr/payments/${impUid}`, {
    headers: {
      Authorization: token,
    },
    cache: 'no-store',
  });

  const data = (await res.json()) as IamportPaymentResponse;
  if (data.code !== 0 || !data.response) {
    throw new Error(data.message || '결제 정보를 조회하지 못했습니다.');
  }

  return data.response;
}
