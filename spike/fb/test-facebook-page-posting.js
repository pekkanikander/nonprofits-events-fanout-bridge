// test-facebook-page-posting.js
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

console.log('\n📝 Testing Facebook Page Posting...\n');
console.log(`Page ID: ${PAGE_ID}`);
console.log(`Token: ${PAGE_ACCESS_TOKEN.substring(0, 20)}...`);

async function testPagePosting() {
  // Test 1: Verify page access
  console.log('\n1️⃣ Verifying page access...');
  const pageResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}?fields=id,name,category&access_token=${PAGE_ACCESS_TOKEN}`);
  const pageData = await pageResponse.json();

  if (pageData.error) {
    console.error('❌ Page access failed:', pageData.error.message);
    return;
  }

  console.log(`✅ Page access successful: ${pageData.name} (${pageData.category})`);

  // Test 2: Create a test post (published directly)
  console.log('\n2️⃣ Testing post creation (published)...');

  const testPostData = {
    message: '🧪 Test post from NE(F)B Bridge - Testing page posting!',
    published: true // Try publishing directly
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

    // Test 3: Try alternative approach - post without published field
    console.log('\n3️⃣ Trying alternative approach (no published field)...');

    const altPostData = {
      message: '🧪 Alternative test post from NE(F)B Bridge!'
    };

    const altPostResponse = await fetch(`https://graph.facebook.com/v18.0/${PAGE_ID}/feed?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(altPostData)
    });

    const altPostResult = await altPostResponse.json();

    if (altPostResult.error) {
      console.error('❌ Alternative post creation also failed:', altPostResult.error.message);
    } else {
      console.log('✅ Alternative post creation successful!');
      console.log(`   Post ID: ${altPostResult.id}`);
      console.log('   Note: Post should be published by default');
    }
  } else {
    console.log('✅ Post creation successful!');
    console.log(`   Post ID: ${postResult.id}`);
    console.log('   Note: Post is now live on your page!');
  }

  console.log('\n🎉 Facebook page posting test completed!');
}

testPagePosting();
