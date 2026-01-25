
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, createNotification } from '@/lib/firebase/firestore';
import type { Order, User } from '@/lib/types';
import { z } from 'zod';

const verificationSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    orderId: z.string(), // This is our internal Firestore order ID
});

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
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

        // 1. Verify Razorpay signature
        const signatureString = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(signatureString)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ success: false, error: 'Invalid payment signature.' }, { status: 400 });
        }

        // 2. Run Firestore transaction to update order and freelancer wallet
        const order = await runTransaction(db, async (transaction) => {
            const orderRef = doc(db, 'orders', orderId);
            const orderDoc = await transaction.get(orderRef);

            if (!orderDoc.exists() || orderDoc.data().status !== 'pending_payment') {
                throw new Error('Order not found or already processed.');
            }

            const orderData = orderDoc.data() as Order;

            const freelancerRef = doc(db, 'users', orderData.freelancerId);
            const freelancerDoc = await transaction.get(freelancerRef);

            if (!freelancerDoc.exists()) {
                throw new Error('Freelancer account not found.');
            }
            
            const freelancerData = freelancerDoc.data() as User;
            const newWalletBalance = (freelancerData.walletBalance || 0) + (orderData.freelancerEarning || 0);

            // Update order
            transaction.update(orderRef, {
                status: 'active',
                paymentId: razorpay_payment_id,
            });

            // Update freelancer wallet
            transaction.update(freelancerRef, {
                walletBalance: newWalletBalance
            });

            return orderData;
        });

        // 3. Create notifications (outside of the transaction for efficiency)
        await Promise.all([
            // For freelancer
            createNotification({
                userId: order.freelancerId,
                type: 'new_order',
                content: `You have a new order from ${order.clientName} for "${order.title}". Your wallet has been credited ₹${order.freelancerEarning?.toFixed(2)}.`,
                link: `/dashboard/my-orders`,
            }),
            // For client
            createNotification({
                userId: order.clientId,
                type: 'order_completed', // Using 'order_completed' for its checkmark icon
                content: `Your payment for "${order.title}" was successful. The order is now active.`,
                link: `/dashboard/my-orders`,
            })
        ]);

        return NextResponse.json({ success: true, message: 'Payment verified and order activated successfully.' });

    } catch (error: any) {
        // Structured error logging - remove sensitive signature
        const { razorpay_signature, ...loggableBody } = body || {};
        console.error(JSON.stringify({
            source: 'razorpay-verify-payment',
            level: 'error',
            message: 'Payment verification failed',
            error: {
                name: error.name,
                message: error.message,
            },
            context: {
                requestBody: loggableBody
            }
        }, null, 2));
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Invalid input data.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
