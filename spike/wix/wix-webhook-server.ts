import express from "express";
import { AppStrategy, createClient } from "@wix/sdk";
import { appInstances } from "@wix/app-management";

const app = express();

// Get public key from environment variable
// You can find this in your Wix app settings or download from Wix Studio
const PUBLIC_KEY = process.env.WIX_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmHWBTQ5o+wqmjyUG0x5g
w7D78FQn4SHXuTQ607P4F0qeMnaxWiSnvOQpAxi/wG0nJKN3POI1Vwp3es6IOcOC
T9aGE/Fm9ltTITB0pvzuQyH9p4f74hQumCdb7sjXj6F9iBLg+gTQSvW/wkEcV7cn
CR4S1Ri4I9HNUWj9lz00ldgGASlHk/zUI4LyhEeZ8I5DCgQrIBoUwl5EyZ8/tzmH
00i3vCeFRcIPBsdHfFTZSEKrWIVW7wwjQCpVcHuGoku3NoWu4jmpEwYsIso6qGjf
roPwSh4LtilcWwQbssXEjA1ZMni1jDgCL0i+gnjyXoeQsig3G5KmxD+CSs43mod8
KQIDAQAB
-----END PUBLIC KEY-----`;

const APP_ID = process.env.WIX_APP_ID || "efa507f6-bf43-4e7e-a023-34e9a7f719b9";

const client = createClient({
  auth: AppStrategy({
    appId: APP_ID,
    publicKey: PUBLIC_KEY,
  }),
  modules: { appInstances },
});

app.post("/webhook", express.text(), async (request, response) => {
  console.log('\n📡 Webhook received at:', new Date().toISOString());

  try {
    await client.webhooks.process(request.body);
    console.log('✅ Webhook processed successfully');

    // Log webhook data for debugging
    console.log('📋 Webhook body:', request.body);

  } catch (err) {
    console.error('❌ Webhook error:', err);
    response
      .status(500)
      .send(`Webhook error: ${err instanceof Error ? err.message : err}`);
    return;
  }

  response.status(200).send();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("Webhook server is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🚀 Wix Webhook Server Started');
  console.log('='.repeat(40));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}/webhook`);
  console.log('\n📋 Next steps:');
  console.log('1. Use ngrok or similar to expose this URL publicly');
  console.log('2. Add the public URL to Wix webhooks configuration');
  console.log('3. Reinstall your app to trigger the webhook');
  console.log('4. Check the webhook logs for instance ID information');
});
