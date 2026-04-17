import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getTransactionStatus } from '@/app/actions/pesapal';

/**
 * @fileOverview Vercel Cron Job to verify "pending" payments directly with PesaPal.
 * Follows the specific authentication pattern requested for security.
 */

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  // 1. Security check for the Cron secret using the exact pattern requested
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { firestore: db } = initializeFirebase();

  try {
    // 2. Find transactions that were initiated but not yet completed
    const q = query(
      collection(db, 'transactions'), 
      where('status', '==', 'pending'),
      where('type', '==', 'recharge')
    );
    
    const snapshot = await getDocs(q);
    const results = [];

    for (const transDoc of snapshot.docs) {
      const data = transDoc.data();
      const trackingId = data.id;

      // 3. Ask PesaPal for the actual status securely on the server
      const statusData = await getTransactionStatus(trackingId);

      if (statusData && statusData.payment_status_description === 'Completed') {
        const userRef = doc(db, 'users', data.userId);
        
        // 4. Update balance securely on the server
        await updateDoc(userRef, {
          balance: increment(data.coins)
        });

        // 5. Mark transaction as completed
        await updateDoc(doc(db, 'transactions', trackingId), {
          status: 'completed',
          verifiedAt: new Date().toISOString()
        });

        results.push({ id: trackingId, status: 'Credited' });
      } else if (statusData && statusData.payment_status_description === 'Failed') {
        await updateDoc(doc(db, 'transactions', trackingId), {
          status: 'failed'
        });
        results.push({ id: trackingId, status: 'Failed' });
      }
    }

    // 6. Return success response as requested
    return new Response(JSON.stringify({ 
      message: "Success",
      processed: results.length,
      details: results 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return new Response(JSON.stringify({ message: "Error", error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
