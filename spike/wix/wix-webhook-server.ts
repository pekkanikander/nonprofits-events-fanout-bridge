import express from "express";
import { AppStrategy, createClient } from "@wix/sdk";
import { appInstances } from "@wix/app-management";

const app = express();

// Use the public key from Wix Studio
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmHWBTQ5o+wqmjyUG0x5g
w7D78FQn4SHXuTQ607P4F0qeMnaxWiSnvOQpAxi/wG0nJKN3POI1Vwp3es6IOcOC
T9aGE/Fm9ltTITB0pvzuQyH9p4f74hQumCdb7sjXj6F9iBLg+gTQSvW/wkEcV7cn
CR4S1Ri4I9HNUWj9lz00ldgGASlHk/zUI4LyhEeZ8I5DCgQrIBoUwl5EyZ8/tzmH
00i3vCeFRcIPBsdHfFTZSEKrWIVW7wwjQCpVcHuGoku3NoWu4jmpEwYsIso6qGjf
roPwSh4LtilcWwQbssXEjA1ZMni1jDgCL0i+gnjyXoeQsig3G5KmxD+CSs43mod8
KQIDAQAB
-----END PUBLIC KEY-----`;

const APP_ID = "efa507f6-bf43-4e7e-a023-34e9a7f719b9";

const client = createClient({
  auth: AppStrategy({
    appId: APP_ID,
    publicKey: PUBLIC_KEY,
  }),
  modules: { appInstances },
});

// This is the key part - captures the real instanceId
client.appInstances.onAppInstanceInstalled((event) => {
  console.log('\n🎯 APP INSTANCE INSTALLED!');
  console.log('='.repeat(50));
  console.log(`Event data:`, JSON.stringify(event, null, 2));
  console.log(`\n✅ REAL INSTANCE ID: ${event.metadata.instanceId}`);
  console.log('='.repeat(50));

  // Save this to a file for easy access
  const fs = require('fs');
  const instanceData = {
    instanceId: event.metadata.instanceId,
    appId: APP_ID,
    timestamp: new Date().toISOString(),
    fullEvent: event
  };

  fs.writeFileSync('real-instance-id.json', JSON.stringify(instanceData, null, 2));
  console.log('\n💾 Instance ID saved to real-instance-id.json');
});

app.post("/webhook", express.text(), async (request, response) => {
  console.log('\n📡 Webhook received at:', new Date().toISOString());

  try {
    await client.webhooks.process(request.body);
    console.log('✅ Webhook processed successfully');
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
  console.log('4. Check real-instance-id.json for the correct instanceId');
});
