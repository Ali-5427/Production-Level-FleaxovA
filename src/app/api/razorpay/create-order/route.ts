
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const orderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('INR'),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { amount, currency } = orderSchema.parse(json);

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
