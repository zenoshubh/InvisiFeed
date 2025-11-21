import { NextResponse } from "next/server";
import dbConnect from "@/lib/db-connect";
import OwnerModel from "@/models/owner";

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

    // Find all users with expired Pro plans
    const now = new Date();
    const expiredUsers = await OwnerModel.find({
      "plan.planName": { $in: ["pro", "pro-trial"] },
      "plan.planEndDate": { $lt: now },
    });

    // Downgrade them to Free plan if any are found
    if (expiredUsers.length > 0) {
        // Use Promise.all for potentially better performance with multiple updates
        await Promise.all(expiredUsers.map(user => {
            user.plan = {
                planName: "free",
                planStartDate: null,
                planEndDate: null,
            };
            return user.save(); // Return the promise from save()
        }));
         console.log(`Successfully downgraded ${expiredUsers.length} expired Pro plans to Free.`);
    } else {
        console.log("No expired Pro plans found to downgrade.");
    }


    return NextResponse.json({
      success: true,
      message: `Cron job executed. Downgraded ${expiredUsers.length} expired Pro plans to Free.`,
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
