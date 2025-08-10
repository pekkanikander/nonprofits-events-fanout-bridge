// check-page-token-permissions.js
import 'dotenv/config';

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!PAGE_ACCESS_TOKEN) {
  console.error('Error: FACEBOOK_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

if (!PAGE_ID) {
  console.error('Error: FACEBOOK_PAGE_ID not found in .env');
  process.exit(1);
}

console.log('\n🔍 Checking Page Access Token Permissions...\n');
console.log(`Page ID: ${PAGE_ID}`);
console.log(`Token: ${PAGE_ACCESS_TOKEN.substring(0, 20)}...`);

async function checkPageTokenPermissions() {
  // Test 1: Check what we can read with this token
  console.log('\n1️⃣ Testing what we can read with Page Access Token...');

  const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?fields=id,name,category,fan_count,verification_status,access_token&access_token=${PAGE_ACCESS_TOKEN}`);
  const pageData = await pageResponse.json();

  if (pageData.error) {
    console.error('❌ Page read failed:', pageData.error.message);
    return;
  }

  console.log('✅ Page read successful:');
  console.log(`   Name: ${pageData.name}`);
  console.log(`   ID: ${pageData.id}`);
  console.log(`   Category: ${pageData.category}`);
  console.log(`   Fan Count: ${pageData.fan_count || 'N/A'}`);
  console.log(`   Verification: ${pageData.verification_status || 'N/A'}`);

  // Test 2: Check if we can get page roles/permissions
  console.log('\n2️⃣ Checking page roles and permissions...');

  const rolesResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?fields=roles&access_token=${PAGE_ACCESS_TOKEN}`);
  const rolesData = await rolesResponse.json();

  if (rolesData.error) {
    console.error('❌ Cannot read page roles:', rolesData.error.message);
  } else if (rolesData.roles && rolesData.roles.data) {
    console.log('✅ Page roles found:');
    rolesData.roles.data.forEach(role => {
      console.log(`   - ${role.name} (${role.id})`);
    });
  } else {
    console.log('⚠️  No page roles found or cannot read them');
  }

  // Test 3: Try to get page insights (admin-only feature)
  console.log('\n3️⃣ Testing admin-only features...');

  const insightsResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}/insights?metric=page_impressions&access_token=${PAGE_ACCESS_TOKEN}`);
  const insightsData = await insightsResponse.json();

  if (insightsData.error) {
    console.error('❌ Cannot read page insights (admin required):', insightsData.error.message);
  } else {
    console.log('✅ Can read page insights (admin access confirmed)!');
  }

  // Test 4: Check if we can modify page settings
  console.log('\n4️⃣ Testing page modification capabilities...');

  const testUpdateResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Try to update something harmless like description
      description: 'Test description update'
    })
  });

  const testUpdateResult = await testUpdateResponse.json();

  if (testUpdateResult.error) {
    console.error('❌ Cannot modify page (admin required):', testUpdateResult.error.message);
  } else {
    console.log('✅ Can modify page settings (admin access confirmed)!');
  }

  console.log('\n🎉 Page Access Token permission check completed!');
  console.log('\n💡 Summary:');
  console.log('   - If you can read insights and modify settings, you have admin access');
  console.log('   - If not, the Page Access Token might not have sufficient privileges');
}

checkPageTokenPermissions();
