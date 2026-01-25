
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db, createNotification, getAdminIds } from '@/lib/firebase/firestore';
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
        const HIGH_VALUE_THRESHOLD = 10000;
        const notificationPromises = [];

        // For freelancer
        notificationPromises.push(createNotification({
            userId: order.freelancerId,
            type: 'new_order',
            content: `You have a new order from ${order.clientName} for "${order.title}". Your wallet has been credited ₹${order.freelancerEarning?.toFixed(2)}.`,
            link: `/dashboard/my-orders/${orderId}`,
        }));
        // For client
        notificationPromises.push(createNotification({
            userId: order.clientId,
            type: 'order_completed',
            content: `Your payment for "${order.title}" was successful. The order is now active.`,
            link: `/dashboard/my-orders/${orderId}`,
        }));
        
        // For Admins if high-value
        if (order.price >= HIGH_VALUE_THRESHOLD) {
            const adminIds = await getAdminIds();
            for (const adminId of adminIds) {
                notificationPromises.push(createNotification({
                    userId: adminId,
                    type: 'order_completed', // checkmark icon
                    content: `High-value service purchased: "${order.title}" for ₹${order.price.toFixed(2)}.`,
                    link: `/dashboard/my-orders/${orderId}`
                }));
            }
        }

        await Promise.all(notificationPromises);

        return NextResponse.json({ success: true, message: 'Payment verified and order activated successfully.' });

    } catch (error: any) {
        // Structured error logging
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

        // Admin notification for critical error
        try {
            const adminIds = await getAdminIds();
            const notificationPromises = adminIds.map(adminId => 
                createNotification({
                    userId: adminId,
                    type: 'withdrawal_rejected', // Using this for a red error icon
                    content: `Critical Payment Error: Verification failed for Razorpay order ${body?.razorpay_order_id}.`,
                    link: `/admin/revenue`
                })
            );
            await Promise.all(notificationPromises);
        } catch (notificationError) {
            console.error("Failed to send admin notification for payment error:", notificationError);
        }
        
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Invalid input data.' }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
