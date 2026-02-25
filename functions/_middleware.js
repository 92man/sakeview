export async function onRequest(context) {
  const url = new URL(context.request.url);

  // pages.dev → sakeview.com 리다이렉트
  if (url.hostname === 'sakeview.pages.dev') {
    url.hostname = 'sakeview.com';
    return Response.redirect(url.toString(), 301);
  }

  // www → non-www 리다이렉트
  if (url.hostname === 'www.sakeview.com') {
    url.hostname = 'sakeview.com';
    return Response.redirect(url.toString(), 301);
  }

  const response = await context.next();

  // 보안 헤더 추가
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
