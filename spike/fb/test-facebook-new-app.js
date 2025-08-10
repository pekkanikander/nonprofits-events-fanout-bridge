// test-facebook-new-app.js
import 'dotenv/config'; // Loads environment variables from .env

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: FACEBOOK_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

console.log('\n🔍 Testing NEW Facebook App with expanded permissions...\n');

async function testNewFacebookApp() {
  // Test 1: Check access token validity
  console.log('1️⃣ Testing new access token validity...');
  const debugTokenResponse = await fetch(`https://graph.facebook.com/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`);
  const debugTokenData = await debugTokenResponse.json();

  if (debugTokenData.error) {
    console.error('❌ Token invalid:', debugTokenData.error.message);
    return;
  }

  if (!debugTokenData.data.is_valid) {
    console.error('❌ Token not valid:', debugTokenData.data.error.message);
    return;
  }

  console.log(`✅ Token valid for user: ${debugTokenData.data.profile_name} (ID: ${debugTokenData.data.user_id})\n`);

  // Test 2: Check new permissions
  console.log('2️⃣ Testing new permissions...');
  const permissionsResponse = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${ACCESS_TOKEN}`);
  const permissionsData = await permissionsResponse.json();

  if (permissionsData.error) {
    console.error('❌ Cannot fetch permissions:', permissionsData.error.message);
    return;
  }

  const grantedPermissions = permissionsData.data
    .filter(p => p.status === 'granted')
    .map(p => p.permission);

  console.log(`✅ Granted permissions:\n   - ${grantedPermissions.join('\n   - ')}\n`);

  // Test 3: Test page access with new permissions
  console.log('3️⃣ Testing page access with new permissions...');

  // First, list accessible pages
  console.log('   📋 Checking accessible pages...');
  const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${ACCESS_TOKEN}`);
  const pagesData = await pagesResponse.json();

  if (pagesData.error) {
    console.error('❌ Cannot fetch user pages:', pagesData.error.message);
    return;
  }

  if (pagesData.data && pagesData.data.length > 0) {
    console.log('✅ User has access to these pages:');
    pagesData.data.forEach(page => {
      console.log(`   📄 ${page.name} (ID: ${page.id}) - ${page.category}`);
    });

    // Test detailed page access with new permissions
    const firstPage = pagesData.data[0];
    console.log(`\n   🔍 Testing detailed access to: ${firstPage.name}...`);

    const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${firstPage.id}?fields=id,name,category,fan_count,verification_status&access_token=${ACCESS_TOKEN}`);
    const pageData = await pageResponse.json();

    if (pageData.error) {
      console.error('❌ Detailed page access failed:', pageData.error.message);
    } else {
      console.log(`✅ Detailed page access successful:`);
      console.log(`   Name: ${pageData.name}`);
      console.log(`   ID: ${pageData.id}`);
      console.log(`   Category: ${pageData.category}`);
      console.log(`   Fan Count: ${pageData.fan_count || 'N/A'}`);
      console.log(`   Verification: ${pageData.verification_status || 'N/A'}\n`);
    }

    // Test 4: Test post creation capability with the discovered page ID
    console.log('4️⃣ Testing post creation capability...');
    console.log(`   📝 Attempting to create a test post on page: ${firstPage.name} (ID: ${firstPage.id})...`);

    const testPostData = {
      message: '🧪 Test post from NE(F)B Bridge - Testing new permissions!',
      published: false // Set to false to avoid actual posting during testing
    };

    const postResponse = await fetch(`https://graph.facebook.com/v18.0/${firstPage.id}/feed?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPostData)
    });

    const postResult = await postResponse.json();

    if (postResult.error) {
      console.error('❌ Post creation failed:', postResult.error.message);
    } else {
      console.log('✅ Post creation successful!');
      console.log(`   Post ID: ${postResult.id}`);
      console.log('   Note: Post was created as unpublished for safety\n');
    }
  }

  console.log('🎉 NEW Facebook App test completed!');
  console.log('📊 Summary: We now have the permissions we need for event fanout!');
}

testNewFacebookApp();
