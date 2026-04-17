
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { getTransactionStatus } from '@/app/actions/pesapal';

/**
 * @fileOverview Cron Job to verify "pending" payments directly with PesaPal.
 * This prevents users from trying to spoof payment successes.
 */

export async function GET(request: Request) {
  // 1. Security check for the Cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
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

      // 3. Ask PesaPal for the actual status
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

    return NextResponse.json({ 
      processed: results.length, 
      details: results 
    });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
