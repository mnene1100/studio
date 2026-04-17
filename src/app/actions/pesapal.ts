
'use server';

/**
 * @fileOverview Server Actions for PesaPal V3 Integration.
 */

interface PesapalOrderInput {
  amount: number;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  description: string;
  callbackUrl: string;
}

async function getPesapalToken() {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const baseUrl = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3';

  const authResponse = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const authData = await authResponse.json();
  return authData.token;
}

export async function createPesapalOrder(input: PesapalOrderInput) {
  const baseUrl = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3';

  try {
    const token = await getPesapalToken();
    if (!token) throw new Error('PesaPal Auth Failed');

    const ipnUrl = new URL(input.callbackUrl).origin + '/api/pesapal/ipn';
    const ipnResponse = await fetch(`${baseUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: ipnUrl,
        ipn_notification_type: 'GET',
      }),
    });

    const ipnData = await ipnResponse.json();
    const ipnId = ipnData.ipn_id;

    const merchantReference = `NEXO_${Date.now()}`;
    const orderResponse = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id: merchantReference,
        currency: 'KES',
        amount: input.amount,
        description: input.description,
        callback_url: input.callbackUrl,
        notification_id: ipnId,
        billing_address: {
          email_address: input.email,
          phone_number: input.phoneNumber || "",
          country_code: 'KE',
          first_name: input.firstName,
          last_name: input.lastName,
        },
      }),
    });

    const orderData = await orderResponse.json();
    return { 
      redirectUrl: orderData.redirect_url, 
      orderTrackingId: orderData.order_tracking_id,
      merchantReference: merchantReference
    };
  } catch (error: any) {
    console.error('PesaPal Error:', error);
    throw error;
  }
}

export async function getTransactionStatus(orderTrackingId: string) {
  const baseUrl = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3';
  
  try {
    const token = await getPesapalToken();
    const response = await fetch(`${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Check Status Error:', error);
    return null;
  }
}
