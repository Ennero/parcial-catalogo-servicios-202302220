import { NextRequest, NextResponse } from 'next/server';

const getBackendUrl = () => {
  return process.env.BACKEND_INTERNAL_URL || 'http://backend:4000';
};

async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path ? params.path.join('/') : '';
  const query = req.nextUrl.search;
  const backendBase = getBackendUrl();
  const targetUrl = `${backendBase}/api/${path}${query}`;

  const headers = new Headers();
  const auth = req.headers.get('authorization');
  if (auth) headers.set('authorization', auth);

  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);

  const accept = req.headers.get('accept');
  if (accept) headers.set('accept', accept);

  const fetchOptions: any = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = await req.text();
    fetchOptions.duplex = 'half';
  }

  try {
    let res = await fetch(targetUrl, fetchOptions);
    if (res.status === 404) {
      const fallbackUrl = `${backendBase}/${path}${query}`;
      const fallbackRes = await fetch(fallbackUrl, fetchOptions);
      if (fallbackRes.status !== 404) {
        res = fallbackRes;
      }
    }
    const body = await res.arrayBuffer();

    const responseHeaders = new Headers();
    const resContentType = res.headers.get('content-type');
    if (resContentType) {
      responseHeaders.set('content-type', resContentType);
    }

    return new NextResponse(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: `Error conectando con el backend (${targetUrl}): ${err.message}`,
        cause: err.cause?.message || String(err.cause),
      },
      { status: 502 },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
