// Cloudflare Worker for Wix webhook
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('Webhook worker is running', { status: 200 });
    }

    // WIX webhook endpoint
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const body = await request.text();

        // Log the webhook data (you can view this in Cloudflare dashboard)
        console.log('🎯 App Instance Installed Webhook Received!');
        console.log('JWT Token:', body);

        // TODO: Decode JWT to extract instanceId
        // For now, just log the raw token

        return new Response('Webhook received', { status: 200 });
      } catch (error) {
        console.error('Error processing webhook:', error);
        return new Response('Error processing webhook', { status: 400 });
      }
    }

    // Facebook webhook endpoint
    if (url.pathname === '/fb') {
      // Handle Facebook webhook verification (GET request)
      if (request.method === 'GET') {
        const params = url.searchParams;
        const mode = params.get('hub.mode');
        const token = params.get('hub.verify_token');
        const challenge = params.get('hub.challenge');

        console.log('🔍 Facebook Webhook Verification Request:');
        console.log('Mode:', mode);
        console.log('Token:', token);
        console.log('Challenge:', challenge);

        // Verify the token matches our expected value
        const expectedToken = 'nefb_webhook_verify_2025';
        if (mode === 'subscribe' && token === expectedToken) {
          console.log('✅ Facebook webhook verification successful');
          return new Response(challenge, { status: 200 });
        } else {
          console.log('❌ Facebook webhook verification failed');
          return new Response('Forbidden', { status: 403 });
        }
      }

      // Handle Facebook webhook data (POST request)
      if (request.method === 'POST') {
        try {
          const body = await request.text();

          // Log the Facebook webhook data
          console.log('📘 Facebook Webhook Received!');
          console.log('Data:', body);

          // TODO: Process Facebook webhook data
          // For now, just log the raw data

          return new Response('Facebook webhook received', { status: 200 });
        } catch (error) {
          console.error('Error processing Facebook webhook:', error);
          return new Response('Error processing Facebook webhook', { status: 400 });
        }
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
