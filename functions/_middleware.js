export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'sakeview.pages.dev') {
    url.hostname = 'sakeview.com';
    return Response.redirect(url.toString(), 301);
  }
  return await context.next();
}
