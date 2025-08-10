// get-facebook-page-token.js
import 'dotenv/config'; // Loads environment variables from .env

const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('Error: FACEBOOK_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

console.log('\n🔑 Getting Facebook Page Access Token...\n');

async function getPageAccessToken() {
  // Step 1: List accessible pages
  console.log('1️⃣ Listing accessible pages...');
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

    // Step 2: Get page access token for the first page
    const firstPage = pagesData.data[0];
    console.log(`\n2️⃣ Getting page access token for: ${firstPage.name}...`);

    const pageTokenResponse = await fetch(`https://graph.facebook.com/v18.0/${firstPage.id}?fields=access_token&access_token=${ACCESS_TOKEN}`);
    const pageTokenData = await pageTokenResponse.json();

    if (pageTokenData.error) {
      console.error('❌ Cannot get page access token:', pageTokenData.error.message);
      return;
    }

    if (pageTokenData.access_token) {
      console.log('✅ Page access token obtained successfully!');
      console.log(`   Page: ${firstPage.name}`);
      console.log(`   Page ID: ${firstPage.id}`);
      console.log(`   Page Access Token: ${pageTokenData.access_token}`);

      console.log('\n📝 Add this to your .env file:');
      console.log(`FACEBOOK_PAGE_ACCESS_TOKEN=${pageTokenData.access_token}`);
      console.log(`FACEBOOK_PAGE_ID=${firstPage.id}`);

      console.log('\n💡 Now you can use the page access token to post to the page!');
    } else {
      console.error('❌ No access_token in response:', pageTokenData);
    }
  } else {
    console.log('⚠️  User has no accessible pages');
  }
}

getPageAccessToken();
