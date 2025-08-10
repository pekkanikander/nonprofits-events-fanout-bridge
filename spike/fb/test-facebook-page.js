#!/usr/bin/env node

/**
 * Simple test script to verify Facebook Page API access
 * Tests: User token validity + Page access permissions
 */

import 'dotenv/config';

const PAGE_ID = '61579130916018';
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

async function testPageAccess() {
  console.log('🔍 Testing Facebook Page API access...\n');

  if (!ACCESS_TOKEN) {
    console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env');
    process.exit(1);
  }

  try {
    // Test 1: Verify access token
    console.log('1️⃣ Testing access token validity...');
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${ACCESS_TOKEN}`);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('❌ Token invalid:', tokenData.error.message);
      return;
    }
    console.log(`✅ Token valid for user: ${tokenData.name} (ID: ${tokenData.id})\n`);

    // Test 2: Check page access
    console.log('2️⃣ Testing page access...');

    // First, let's see what pages this user can access
    console.log('   📋 Checking accessible pages...');
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${ACCESS_TOKEN}`);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      console.error('❌ Cannot fetch user pages:', pagesData.error.message);
    } else if (pagesData.data && pagesData.data.length > 0) {
      console.log('✅ User has access to these pages:');
      pagesData.data.forEach(page => {
        console.log(`   📄 ${page.name} (ID: ${page.id}) - ${page.category}`);
      });

      // Try to access the first available page instead
      const firstPage = pagesData.data[0];
      console.log(`\n   🔍 Testing access to first page: ${firstPage.name}...`);

      const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${firstPage.id}?fields=id,name,category&access_token=${ACCESS_TOKEN}`);
      const pageData = await pageResponse.json();

      if (pageData.error) {
        console.error('❌ Page access failed:', pageData.error.message);
      } else {
        console.log(`✅ Page access granted:`);
        console.log(`   Name: ${pageData.name}`);
        console.log(`   ID: ${pageData.id}`);
        console.log(`   Category: ${pageData.category}\n`);
      }
    } else {
      console.log('⚠️  User has no accessible pages');

      // Try the original page ID as fallback
      console.log(`   🔍 Trying original page ID: ${PAGE_ID}...`);
      const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?fields=id,name,category&access_token=${ACCESS_TOKEN}`);
      const pageData = await pageResponse.json();

      if (pageData.error) {
        console.error('❌ Page access failed:', pageData.error.message);
        console.log('💡 You may need to grant page permissions in Graph API Explorer');
        return;
      }

      console.log(`✅ Page access granted:`);
      console.log(`   Name: ${pageData.name}`);
      console.log(`   ID: ${pageData.id}`);
      console.log(`   Category: ${pageData.category}\n`);
    }

    // Test 3: Check post permissions
    console.log('3️⃣ Testing post permissions...');
    const permissionsResponse = await fetch(`https://graph.facebook.com/v18.0/me/permissions?access_token=${ACCESS_TOKEN}`);
    const permissionsData = await permissionsResponse.json();

    const relevantPerms = permissionsData.data?.filter(p =>
      p.permission.includes('pages_') && p.status === 'granted'
    ) || [];

    console.log('✅ Granted page permissions:');
    relevantPerms.forEach(perm => {
      console.log(`   - ${perm.permission}`);
    });

    if (relevantPerms.length === 0) {
      console.log('⚠️  No page permissions found - may need to request in Graph API Explorer');
    }

    console.log('\n🎉 Facebook API access test completed!');

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPageAccess();
