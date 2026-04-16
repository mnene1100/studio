'use server';

/**
 * @fileOverview Server Actions for PesaPal V3 Integration.
 * Updated for Production (Live) environment.
 */

interface PesapalOrderInput {
  amount: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  description: string;
  callbackUrl: string;
}

export async function createPesapalOrder(input: PesapalOrderInput) {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  // Use production URL by default if not specified in env
  const baseUrl = process.env.PESAPAL_BASE_URL || 'https://pay.pesapal.com/v3';

  if (!consumerKey || !consumerSecret) {
    throw new Error('PesaPal credentials are not configured on the server.');
  }

  try {
    // 1. Get Authentication Token
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
    if (!authData.token) {
      console.error('PesaPal Auth Error:', authData);
      throw new Error('Failed to authenticate with PesaPal.');
    }

    const token = authData.token;

    // 2. Register IPN
    const ipnResponse = await fetch(`${baseUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: `${input.callbackUrl.replace('/callback', '/ipn')}`,
        ipn_notification_type: 'GET',
      }),
    });

    const ipnData = await ipnResponse.json();
    const ipnId = ipnData.ipn_id;

    // 3. Submit Order Request
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
          phone_number: input.phoneNumber || '0700000000',
          country_code: 'KE',
          first_name: input.firstName,
          last_name: input.lastName,
        },
      }),
    });

    const orderData = await orderResponse.json();
    
    if (orderData.redirect_url) {
      return { redirectUrl: orderData.redirect_url, orderTrackingId: orderData.order_tracking_id };
    } else {
      console.error('PesaPal Order Error:', orderData);
      throw new Error(orderData.message || 'Failed to initiate PesaPal transaction.');
    }

  } catch (error: any) {
    console.error('PesaPal Integration Error:', error);
    throw error;
  }
}
