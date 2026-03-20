import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch full profile by wallet
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { wallet },
    include: {
      orders: {
        orderBy: { createdAt: "desc" }
      },
      reviews: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH - update profile
export async function PATCH(req: NextRequest) {
  const { wallet, name, email } = await req.json();

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { wallet },
    data: { name, email }
  });

  return NextResponse.json(user);
}