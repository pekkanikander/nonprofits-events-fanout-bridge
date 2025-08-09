#!/usr/bin/env tsx

/**
 * Wix OAuth 2.0 Implementation - No External Libraries Needed
 *
 * The OAuth token exchange is a simple HTTP POST request.
 * Node.js fetch() is sufficient - no need for additional libraries.
 */

import { readFileSync } from 'fs';

interface WixOAuthCredentials {
  appId: string;
  appSecret: string;
  instanceId: string;
}

interface WixAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface WixOAuthError {
  error: string;
  error_description?: string;
}

function loadWixCredentials(): WixOAuthCredentials | null {
  try {
    const envContent = readFileSync('.env', 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });

    // Use development site credentials for now
    const appId = envVars.WIX_APP_ID || envVars.DEV_WIX_APP_ID;
    const appSecret = envVars.WIX_APP_SECRET || envVars.DEV_WIX_APP_SECRET;
    const instanceId = envVars.WIX_INSTANCE_ID || envVars.DEV_WIX_INSTANCE_ID;

    if (!appId || !appSecret || !instanceId) {
      return null;
    }

    return { appId, appSecret, instanceId };

  } catch (error) {
    console.error('Error loading credentials:', error);
    return null;
  }
}

/**
 * Exchange Wix app credentials for OAuth access token
 *
 * Uses the proper OAuth 2.0 client_credentials flow as documented:
 * https://dev.wix.com/docs/rest/app-management/oauth-2/create-access-token
 */
async function getWixAccessToken(credentials: WixOAuthCredentials): Promise<WixAccessTokenResponse> {
  console.log('🔑 Exchanging credentials for OAuth access token...');
  console.log(`App ID: ${credentials.appId}`);
  console.log(`Instance ID: ${credentials.instanceId}`);
  console.log(`App Secret: ${credentials.appSecret.substring(0, 8)}...`);

  const tokenEndpoint = 'https://www.wixapis.com/oauth2/token';

  const requestBody = {
    grant_type: 'client_credentials',
    client_id: credentials.appId,
    client_secret: credentials.appSecret,
    instance_id: credentials.instanceId
  };

  console.log('\n📤 Making OAuth token request...');
  console.log(`POST ${tokenEndpoint}`);
  console.log('Body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);

    // Show response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('Response Headers:', JSON.stringify(responseHeaders, null, 2));

    const responseText = await response.text();

    if (response.ok) {
      console.log('🎉 SUCCESS! OAuth token received!');
      const tokenData: WixAccessTokenResponse = JSON.parse(responseText);

      console.log('\n✅ Access Token Response:');
      console.log(`Token Type: ${tokenData.token_type}`);
      console.log(`Expires In: ${tokenData.expires_in} seconds (${Math.round(tokenData.expires_in / 3600)} hours)`);
      console.log(`Access Token: ${tokenData.access_token.substring(0, 20)}...`);

      return tokenData;

    } else {
      console.log('❌ OAuth token request failed');

      try {
        const errorData: WixOAuthError = JSON.parse(responseText);
        console.log('Error Response:', JSON.stringify(errorData, null, 2));

        throw new Error(`OAuth token request failed: ${errorData.error} - ${errorData.error_description || 'No description'}`);
      } catch (parseError) {
        console.log('Raw error response:', responseText);
        throw new Error(`OAuth token request failed with status ${response.status}: ${responseText}`);
      }
    }

  } catch (error) {
    console.error('❌ OAuth token request error:', error);
    throw error;
  }
}

/**
 * Test the complete OAuth flow
 */
async function testWixOAuthFlow() {
  console.log('🎯 Testing Wix OAuth 2.0 Flow');
  console.log('═'.repeat(50));
  console.log('');

  // Load credentials
  const credentials = loadWixCredentials();
  if (!credentials) {
    console.log('❌ Missing Wix credentials in .env file');
    console.log('');
    console.log('Required credentials:');
    console.log('WIX_APP_ID=your-app-id');
    console.log('WIX_APP_SECRET=your-app-secret');
    console.log('WIX_INSTANCE_ID=your-instance-id');
    return;
  }

  try {
    // Step 1: Get OAuth access token
    const tokenData = await getWixAccessToken(credentials);

    console.log('\n🚀 OAuth flow completed successfully!');
    console.log('Ready to use access token for Events API calls.');

    return tokenData;

  } catch (error) {
    console.error('❌ OAuth flow failed:', error);

    console.log('\n🔍 Troubleshooting:');
    console.log('1. Verify app credentials are correct');
    console.log('2. Ensure app is installed on the site');
    console.log('3. Check that instance ID is valid');
    console.log('4. Confirm app has proper permissions');
  }
}

async function main() {
  await testWixOAuthFlow();

  console.log('\n📋 Next Steps:');
  console.log('If OAuth token exchange succeeds:');
  console.log('1. Use access_token for Events V3 API calls');
  console.log('2. Include as Authorization: Bearer ACCESS_TOKEN');
  console.log('3. Test Events API endpoints');
  console.log('4. Celebrate fixing the authentication! 🎉');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
