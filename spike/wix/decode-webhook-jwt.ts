#!/usr/bin/env npx tsx

/**
 * Generic JWT decoder for Wix webhooks
 * Usage:
 * 1. Set JWT_TOKEN environment variable, or
 * 2. Pass as command line argument: npx tsx decode-webhook-jwt.ts <jwt_token>
 */

const getJWTToken = (): string => {
  // Try command line argument first
  if (process.argv[2]) {
    return process.argv[2];
  }

  // Try environment variable
  if (process.env.JWT_TOKEN) {
    return process.env.JWT_TOKEN;
  }

  console.error('❌ No JWT token provided!');
  console.log('Usage: npx tsx decode-webhook-jwt.ts <jwt_token>');
  console.log('Or set JWT_TOKEN environment variable');
  process.exit(1);
};

const decodeJWT = (jwtToken: string) => {
  console.log('🔍 Decoding Wix webhook JWT token...\n');

  try {
    // Split JWT into parts
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode header
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    console.log('📋 JWT Header:');
    console.log(JSON.stringify(header, null, 2));

    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    console.log('\n📋 JWT Payload:');
    console.log(JSON.stringify(payload, null, 2));

    // Parse the nested data string
    const data = JSON.parse(payload.data);
    console.log('\n📋 Parsed Data:');
    console.log(JSON.stringify(data, null, 2));

    // Extract key information
    console.log('\n🎯 KEY INFORMATION:');
    console.log('==================');
    console.log(`✅ REAL INSTANCE ID: ${data.instanceId}`);
    console.log(`✅ App ID: ${JSON.parse(data.data).appId}`);
    console.log(`✅ Event Type: ${data.eventType}`);
    console.log(`✅ Wix User ID: ${JSON.parse(data.identity).wixUserId}`);

    // Save to env format
    console.log('\n💾 UPDATE YOUR .env FILE:');
    console.log('=========================');
    console.log(`DEV_WIX_INSTANCE_ID=${data.instanceId}`);

  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
  }
};

const jwtToken = getJWTToken();
decodeJWT(jwtToken);
