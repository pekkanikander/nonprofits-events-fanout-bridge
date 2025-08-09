#!/usr/bin/env npx tsx

/**
 * Decode the JWT token from the Wix webhook to extract the real instanceId
 */

const jwtToken = 'eyJraWQiOiJSS3d6OWJELSIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiZGF0YVwiOlwie1xcXCJhcHBJZFxcXCI6XFxcImVmYTUwN2Y2LWJmNDMtNGU3ZS1hMDIzLTM0ZTlhN2Y3MTliOVxcXCIsXFxcIm9yaWdpbkluc3RhbmNlSWRcXFwiOlxcXCJcXFwifVwiLFwiaW5zdGFuY2VJZFwiOlwiNWVmNTBmMTEtYWViZi00NmQwLWFiNmUtNTlhNTE2ZDkxNGQzXCIsXCJldmVudFR5cGVcIjpcIkFwcEluc3RhbGxlZFwiLFwiaWRlbnRpdHlcIjpcIntcXFwiaWRlbnRpdHlUeXBlXFxcIjpcXFwiV0lYX1VTRVJcXFwiLFxcXCJ3aXhVc2VySWRcXFwiOlxcXCI3NWNlZTJkMy01NjZmLTQ4NzUtOTc1Ny01NThlMmI1NzcxMjhcXFwifVwiLFwid2ViaG9va0lkXCI6XCJ3SWRfMTc1NDc1MzE4MzY1MF8tMTU4MjQyMjk0NV9fdHlWSHVcIn0iLCJpYXQiOjE3NTQ3NTMxODQsImV4cCI6MTc1ODM1MzE4NH0.IGGm98uSe2HrHly8kWhwqhQ-pEmSgxRheQtnjpCrZ7fu5H1tgsJ03mCf5ubJ4xVXUuwhW-TGTLZRlyM-1CPW8ryjKkUkai4abK2p04koqbuhwKgkU5tl4ISyQZ5XrjVOa1WcxnxpIGjBAHtVFJzu0YHwsfn4cVeP6sAwoUfkIbd9O8A6BSDQxfnNuEO70Z6wOxq92-WTgQbSkYTfz1oCJNRxN4jNP95DrnuiGeEpPyq6-NiIomRsoS1DanEP7aqBk3_p-2hf6gIIK0TDubwt9TlZjFYsoQCw7WqzXW3YCSKiZ3ZN9BgDofLwe7cXwZ4JC4bIofyxzKU-g9zphq0Y5Q';

const decodeJWT = () => {
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

    // Compare with old instance ID
    console.log('\n🔍 COMPARISON:');
    console.log('==============');
    console.log(`OLD (wrong) Instance ID: 75cee2d3-566f-4875-9757-558e2b577128`);
    console.log(`NEW (real) Instance ID:  ${data.instanceId}`);
    console.log(`Different: ${data.instanceId !== '75cee2d3-566f-4875-9757-558e2b577128' ? '✅ YES' : '❌ NO'}`);

    // Save to env format
    console.log('\n💾 UPDATE YOUR .env FILE:');
    console.log('=========================');
    console.log(`DEV_WIX_INSTANCE_ID=${data.instanceId}`);

  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
  }
};

decodeJWT();
