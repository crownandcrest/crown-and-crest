import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR" } = await request.json();

    // Razorpay expects amount in paisa (100 paisa = 1 Rupee)
    const options = {
      amount: Math.round(amount * 100), 
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 }
    );
  }
}