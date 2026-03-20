import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) return NextResponse.json({ error: "Wallet address required" }, { status: 400 });

    const orders = await prisma.order.findMany({
      where: { buyer: wallet },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);

  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, listingId, tokenId, buyer, seller, price, quantity, receiptHash, receiptURI } = await req.json();

    if (!orderId || !buyer || !seller) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user exists, if not create them
    await prisma.user.upsert({
      where: { wallet: buyer },
      update: {},
      create: { wallet: buyer }
    });

    const order = await prisma.order.create({
      data: { orderId, listingId, tokenId, buyer, seller, price, quantity, receiptHash, receiptURI }
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json(order);

  } catch (error) {
    console.error("PATCH /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}