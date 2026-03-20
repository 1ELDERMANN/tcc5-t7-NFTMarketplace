import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { wallet },
      include: { orders: true, reviews: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);

  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { wallet, name, email } = await req.json();
    if (!wallet) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const user = await prisma.user.upsert({
      where: { wallet },
      update: { name, email },
      create: { wallet, name, email }
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}