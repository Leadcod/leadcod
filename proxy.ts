import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers';

 
// This function can be marked `async` if using `await` inside
export async function proxy(req: NextRequest) {
    const res = NextResponse.next();
    const locale = req.nextUrl.searchParams.get('locale')?.split('-')[0] || 'en';
    res.cookies.set('locale', locale);

    return res;
}
 
export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
}