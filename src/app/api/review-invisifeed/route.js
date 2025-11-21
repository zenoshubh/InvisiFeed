import dbConnect from "@/lib/db-connect";
import InvisifeedReviewModel from "@/models/invisifeed-review";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const  username  = session?.user?.username;
  
    if (!username) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { review } = await request.json();

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Missing review" },
        { status: 400 }
      );
    }

    const newReview = new InvisifeedReviewModel({
      review,
    });

    await newReview.save();

    return NextResponse.json(
      { success: true, message: "Review sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reviews = await InvisifeedReviewModel.find();
    return NextResponse.json(
      { success: true, reviews, message: "Reviews fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
