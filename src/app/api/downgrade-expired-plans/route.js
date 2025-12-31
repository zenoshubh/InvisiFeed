import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import SubscriptionModel from "@/models/subscription";

// --- Configuration ---
// Ensure you set this environment variable in your deployment environment.
// Generate a strong, random string for this secret.
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req) {
  // --- Security Check ---
  // Check if the CRON_SECRET is configured on the server
  if (!CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set.");
    // Return a generic error to avoid revealing configuration issues
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }

  // Get the authorization header from the incoming request
  const authHeader = req.headers.get("Authorization");

  // Check if the header exists and follows the "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("Unauthorized access attempt: Missing or invalid Authorization header.");
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 } // 401 Unauthorized
    );
  }

  // Extract the token from the header
  const submittedSecret = authHeader.substring(7); // Remove "Bearer " prefix

  // Compare the submitted token with the environment variable
  if (submittedSecret !== CRON_SECRET) {
    console.warn("Unauthorized access attempt: Invalid secret.");
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 } // 403 Forbidden
    );
  }

  // --- Original Logic (if authorized) ---
  try {
    await dbConnect();

    // Find all expired Pro subscriptions - only fetch needed fields
    const now = new Date();
    const expiredSubscriptions = await SubscriptionModel.find({
      planType: { $in: ["pro", "pro-trial"] },
      status: "active",
      endDate: { $lt: now },
    })
      .select('_id business planType status endDate')
      .lean();

    // Downgrade them to Free plan if any are found
    let downgradedCount = 0;
    if (expiredSubscriptions.length > 0) {
      // Update all expired subscriptions to expired status
      await SubscriptionModel.updateMany(
        {
          _id: { $in: expiredSubscriptions.map((sub) => sub._id) },
        },
        {
          status: "expired",
        }
      );

      // Create free subscriptions for businesses that don't have active free subscriptions
      const businessIds = expiredSubscriptions.map((sub) => sub.business);
      const existingFreeSubscriptions = await SubscriptionModel.find({
        business: { $in: businessIds },
        planType: "free",
        status: "active",
      })
        .select('business')
        .lean();

      const businessesWithFree = new Set(
        existingFreeSubscriptions.map((sub) => sub.business.toString())
      );

      const businessesNeedingFree = businessIds.filter(
        (id) => !businessesWithFree.has(id.toString())
      );

      if (businessesNeedingFree.length > 0) {
        await SubscriptionModel.insertMany(
          businessesNeedingFree.map((businessId) => ({
            business: businessId,
            planType: "free",
            status: "active",
            startDate: now,
            endDate: null,
          }))
        );
      }

      downgradedCount = expiredSubscriptions.length;
      console.log(`Successfully downgraded ${downgradedCount} expired Pro plans to Free.`);
    } else {
      console.log("No expired Pro plans found to downgrade.");
    }

    return NextResponse.json({
      success: true,
      message: `Cron job executed. Downgraded ${downgradedCount} expired Pro plans to Free.`,
    });
  } catch (error) {
    console.error("Error downgrading expired plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to downgrade expired plans during cron execution",
      },
      { status: 500 }
    );
  }
}
