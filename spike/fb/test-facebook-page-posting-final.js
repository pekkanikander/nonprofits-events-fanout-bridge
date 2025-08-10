// test-facebook-page-posting-final.js
import 'dotenv/config';

const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const PAGE_ID = process.env.FACEBOOK_PAGE_ID;

if (!PAGE_ACCESS_TOKEN) {
  console.error('Error: FACEBOOK_PAGE_ACCESS_TOKEN not found in .env');
  console.log('Please add FACEBOOK_PAGE_ACCESS_TOKEN to your .env file first');
  process.exit(1);
}

if (!PAGE_ID) {
  console.error('Error: FACEBOOK_PAGE_ID not found in .env');
  process.exit(1);
}

console.log('\n📝 Testing Facebook Page Posting with REAL Page Access Token...\n');
console.log(`Page ID: ${PAGE_ID}`);
console.log(`Token: ${PAGE_ACCESS_TOKEN.substring(0, 20)}...`);

async function testPagePosting() {
  // Test 1: Verify page access with Page Token
  console.log('\n1️⃣ Verifying page access with Page Access Token...');

  const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?fields=id,name,category&access_token=${PAGE_ACCESS_TOKEN}`);
  const pageData = await pageResponse.json();

  if (pageData.error) {
    console.error('❌ Page access failed:', pageData.error.message);
    return;
  }

  console.log(`✅ Page access successful: ${pageData.name} (${pageData.category})`);

  // Test 2: Create a test post
  console.log('\n2️⃣ Testing post creation with Page Access Token...');

  const testPostData = {
    message: '🧪 Test post from NE(F)B Bridge - Testing with REAL Page Access Token!'
  };

  const postResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}/feed?access_token=${PAGE_ACCESS_TOKEN}`, {
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
    console.log('   🎉 The post is now live on your Facebook page!');

    // Test 3: Verify the post was created
    console.log('\n3️⃣ Verifying post was created...');

    const verifyResponse = await fetch(`https://graph.facebook.com/v18.0/${postResult.id}?fields=id,message,created_time&access_token=${PAGE_ACCESS_TOKEN}`);
    const verifyData = await verifyResponse.json();

    if (verifyData.error) {
      console.error('❌ Cannot verify post:', verifyData.error.message);
    } else {
      console.log('✅ Post verification successful:');
      console.log(`   Message: ${verifyData.message}`);
      console.log(`   Created: ${verifyData.created_time}`);
    }
  }

  console.log('\n🎉 Facebook page posting test completed!');
  if (postResult.id) {
    console.log('🚀 SUCCESS: We can now post events to Facebook!');
  }
}

testPagePosting();
