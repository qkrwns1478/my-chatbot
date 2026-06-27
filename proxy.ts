import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/auth';

export async function proxy(request: NextRequest) {
  const session = await updateSession(request);
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isApiAuth = pathname.startsWith('/api/auth');

  if (!session && !isAuthPage && !isApiAuth && !pathname.includes('.')) {
      // 인증되지 않은 유저가 보호된 페이지에 접근
      return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isAuthPage) {
      // 이미 로그인된 유저가 로그인/회원가입 페이지에 접근
      return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // But include API routes for authentication checks
    '/api/characters/:path*',
    '/api/chatrooms/:path*',
    '/api/interactions/:path*',
  ],
};
