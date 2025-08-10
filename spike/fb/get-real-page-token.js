// get-real-page-token.js
import 'dotenv/config';

const USER_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!USER_ACCESS_TOKEN) {
  console.error('Error: FACEBOOK_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

console.log('\n🔑 Getting REAL Facebook Page Access Token...\n');
console.log('Note: This script uses your User Access Token to get a Page Access Token');

async function getRealPageToken() {
  // Step 1: List accessible pages with User Token
  console.log('1️⃣ Listing accessible pages with User Token...');
  const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${USER_ACCESS_TOKEN}`);
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

    // Step 2: Get page access token for the first page
    const firstPage = pagesData.data[0];
    console.log(`\n2️⃣ Getting page access token for: ${firstPage.name}...`);

    const pageTokenResponse = await fetch(`https://graph.facebook.com/v18.0/${firstPage.id}?fields=access_token&access_token=${USER_ACCESS_TOKEN}`);
    const pageTokenData = await pageTokenResponse.json();

    if (pageTokenData.error) {
      console.error('❌ Cannot get page access token:', pageTokenData.error.message);
      return;
    }

    if (pageTokenData.access_token) {
      console.log('✅ REAL Page access token obtained successfully!');
      console.log(`   Page: ${firstPage.name}`);
      console.log(`   Page ID: ${firstPage.id}`);
      console.log(`   Page Access Token: ${pageTokenData.access_token}`);

      console.log('\n📝 Update your .env file with:');
      console.log(`FACEBOOK_PAGE_ACCESS_TOKEN=${pageTokenData.access_token}`);
      console.log(`FACEBOOK_PAGE_ID=${firstPage.id}`);

      console.log('\n💡 Keep your original FACEBOOK_ACCESS_TOKEN as the User Token');
      console.log('   Use FACEBOOK_PAGE_ACCESS_TOKEN for posting to pages');

      console.log('\n🚀 Now you should be able to post to the page!');
    } else {
      console.error('❌ No access_token in response:', pageTokenData);
    }
  } else {
    console.log('⚠️  User has no accessible pages');
  }
}

getRealPageToken();
