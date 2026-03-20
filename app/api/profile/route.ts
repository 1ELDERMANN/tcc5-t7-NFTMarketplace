import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { wallet },
      include: {
        orders: { orderBy: { createdAt: "desc" } },
        reviews: { orderBy: { createdAt: "desc" } }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);

  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { wallet, name, email } = await req.json();
    if (!wallet) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const user = await prisma.user.update({
      where: { wallet },
      data: { name, email }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}