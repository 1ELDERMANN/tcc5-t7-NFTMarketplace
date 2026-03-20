import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tokenId = req.nextUrl.searchParams.get("tokenId");
    if (!tokenId) return NextResponse.json({ error: "Token ID required" }, { status: 400 });

    const reviews = await prisma.review.findMany({
      where: { tokenId: parseInt(tokenId) },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { wallet: true, name: true } } }
    });

    return NextResponse.json(reviews);

  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content, rating, tokenId, wallet } = await req.json();

    if (!content || !rating || !tokenId || !wallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if user exists, if not create them
    await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet }
    });

    const review = await prisma.review.create({
      data: { content, rating, tokenId, wallet }
    });

    return NextResponse.json(review);

  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Review ID required" }, { status: 400 });

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ message: "Review deleted successfully" });

  } catch (error) {
    console.error("DELETE /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}