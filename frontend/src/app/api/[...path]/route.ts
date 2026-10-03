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
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
      headers.set(key, value);
    }
  });

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = await req.text();
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const body = await res.arrayBuffer();

    const responseHeaders = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('content-type', contentType);
    }

    return new NextResponse(body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: `Error conectando con el backend (${targetUrl}): ${err.message}` },
      { status: 502 },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
