
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, createNotification } from '@/lib/firebase/firestore';
import type { Order } from '@/lib/types';
import { z } from 'zod';

const verificationSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    orderId: z.string(), // This is our internal Firestore order ID
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
    } = verificationSchema.parse(body);

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
        throw new Error("Razorpay key secret is not configured.");
    }
    
    // Create the signature string
    const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    // Generate the expected signature
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signatureString)
      .digest('hex');

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature.' }, { status: 400 });
    }
    
    // If signature is valid, update the order in Firestore
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists() || orderDoc.data().status !== 'pending_payment') {
         return NextResponse.json({ success: false, error: 'Order not found or already processed.' }, { status: 404 });
    }

    await updateDoc(orderRef, {
        status: 'active',
        paymentId: razorpay_payment_id,
    });
    
    const order = orderDoc.data() as Order;
    // Create notification for the freelancer
    await createNotification({
        userId: order.freelancerId,
        type: 'new_order',
        content: `You have a new order from ${order.clientName} for "${order.title}".`,
        link: `/dashboard/my-orders`,
    });

    return NextResponse.json({ success: true, message: 'Payment verified successfully.' });

  } catch (error) {
    console.error('Payment verification failed:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: 'Invalid input data.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
