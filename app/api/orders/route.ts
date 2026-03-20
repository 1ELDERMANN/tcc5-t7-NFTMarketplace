import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch orders by wallet
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { buyer: wallet },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(orders);
}

// POST - save a new order after blockchain transaction
export async function POST(req: NextRequest) {
  const {
    orderId,
    listingId,
    tokenId,
    buyer,
    seller,
    price,
    quantity,
    receiptHash,
    receiptURI
  } = await req.json();

  if (!orderId || !buyer || !seller) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      orderId,
      listingId,
      tokenId,
      buyer,
      seller,
      price,
      quantity,
      receiptHash,
      receiptURI
    }
  });

  return NextResponse.json(order);
}

// PATCH - update order status
export async function PATCH(req: NextRequest) {
  const { orderId, status } = await req.json();

  if (!orderId || !status) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  return NextResponse.json(order);
}