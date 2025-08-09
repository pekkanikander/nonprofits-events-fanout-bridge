#!/usr/bin/env npx tsx

/**
 * Test complete minimal event with all required fields identified
 */

const testCompleteMinimalEvent = async () => {
  console.log('🎯 Testing complete minimal event with required fields...\n');

  // Get OAuth token
  const getAccessToken = async () => {
    const config = {
      appId: process.env.DEV_WIX_APP_ID || 'efa507f6-bf43-4e7e-a023-34e9a7f719b9',
      appSecret: process.env.DEV_WIX_APP_SECRET || '9aa9ee96-cc56-4d00-8996-b7adff4a4dc3',
      instanceId: process.env.DEV_WIX_INSTANCE_ID || '5ef50f11-aebf-46d0-ab6e-59a516d914d3'
    };

    const response = await fetch('https://www.wixapis.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: config.appId,
        client_secret: config.appSecret,
        instance_id: config.instanceId,
      }),
    });

    const data = await response.json();
    return data.access_token;
  };

  try {
    console.log('🔑 Getting OAuth token...');
    const accessToken = await getAccessToken();
    console.log('✅ Got access token\n');

    // Complete minimal event with all required fields
    const eventData = {
      event: {
        title: "NEFB Cleanup Verification Event",
        dateAndTimeSettings: {
          startDate: "2025-09-15T14:00:00Z",
          endDate: "2025-09-15T16:00:00Z",  // Different date/time
          timeZoneId: "Europe/Helsinki"
        },
        location: {  // Required field
          type: "ONLINE",
          name: "Online Event Location"
        },
        registration: {  // Required field
          initialType: "RSVP"
        }
      }
    };

    console.log('📤 Complete minimal event request:');
    console.log(JSON.stringify(eventData, null, 2));

    const response = await fetch('https://www.wixapis.com/events/v3/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    console.log(`\n📊 Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('🎉🎉🎉 SUCCESS! First Wix event created! 🎉🎉🎉');
      console.log(`Event ID: ${result.event.id}`);
      console.log(`Title: ${result.event.title}`);
      console.log(`Status: ${result.event.status}`);
      console.log('\n✅ Wix Events API integration is now working!');

      // Show the complete event object
      console.log('\n📋 Complete event response:');
      console.log(JSON.stringify(result.event, null, 2));

      return result.event.id;
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testCompleteMinimalEvent();
