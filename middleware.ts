import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/api/orders",
  "/api/reviews",
  "/api/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const wallet = req.headers.get("x-wallet-address");

    if (!wallet) {
      return NextResponse.json(
        { error: "Unauthorized - wallet address required" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"]
};