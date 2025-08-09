// Cloudflare Worker for Wix webhook
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response('Webhook worker is running', { status: 200 });
    }

    // Webhook endpoint
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

    return new Response('Not found', { status: 404 });
  },
};
