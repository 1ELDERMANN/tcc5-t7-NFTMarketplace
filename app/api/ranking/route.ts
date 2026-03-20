import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - fetch top selling products by tokenId
export async function GET() {
  const rankings = await prisma.order.groupBy({
    by: ["tokenId"],
    _count: { tokenId: true },
    _sum: { quantity: true, price: true },
    orderBy: {
      _count: { tokenId: "desc" }
    },
    take: 10
  });

  const formatted = rankings.map((item, index) => ({
    rank: index + 1,
    tokenId: item.tokenId,
    totalOrders: item._count.tokenId,
    totalQuantitySold: item._sum.quantity,
    totalRevenue: item._sum.price
  }));

  return NextResponse.json(formatted);
}