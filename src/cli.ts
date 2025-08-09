#!/usr/bin/env node

import { GoogleCalendarIngestor } from './ingestion/gcal.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  calendarId?: string;
}

function loadConfig(): Config | null {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) {
    return null;
  }

  const envContent = readFileSync(envPath, 'utf8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      env[key.trim()] = value;
    }
  }

  if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
    return null;
  }

  return {
    clientId: env.CLIENT_ID,
    clientSecret: env.CLIENT_SECRET,
    redirectUri: env.REDIRECT_URI || 'http://localhost:3000/callback',
    refreshToken: env.REFRESH_TOKEN,
    calendarId: env.CALENDAR_ID
  };
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
NEFB Events Bridge - Google Calendar Integration

Usage:
  npm run dev auth                    # Get OAuth2 authorization URL
  npm run dev token <code>           # Exchange auth code for tokens
  npm run dev fetch [calendarId]     # Fetch events from calendar

Setup:
  1. Create Google Cloud Project and enable Calendar API
  2. Create OAuth2 credentials and download JSON
  3. Add CLIENT_ID, CLIENT_SECRET, REDIRECT_URI to .env file
  4. Run 'npm run dev auth' to get authorization URL
  5. Visit URL and authorize, then run 'npm run dev token <code>'
  6. Add REFRESH_TOKEN to .env file
  7. Run 'npm run dev fetch' to test event fetching
`);
    return;
  }

  const config = loadConfig();
  if (!config) {
    console.error('❌ No config found. Please create .env file with your credentials.');
    return;
  }

  const ingestor = new GoogleCalendarIngestor(config);

  try {
    switch (command) {
      case 'auth':
        const authUrl = ingestor.getAuthUrl();
        console.log('\n🔑 Authorize this app by visiting this URL:');
        console.log(authUrl);
        console.log('\n📝 Visit URL, authorize, then copy "code" parameter from redirect URL');
        break;

      case 'token':
        const code = args[1];
        if (!code) {
          console.error('❌ Please provide the authorization code from the redirect URL.');
          return;
        }
        const tokens = await ingestor.getTokensFromCode(code);
        console.log('\n✅ Tokens obtained:');
        console.log('Access token:', tokens.access_token);
        if (tokens.refresh_token) {
          console.log('Refresh token:', tokens.refresh_token);
          console.log('\n💾 Add this to your .env file:');
          console.log(`REFRESH_TOKEN=${tokens.refresh_token}`);
        } else {
          console.log('⚠️  No refresh token received. This may happen if already authorized.');
        }
        break;

      case 'fetch':
        if (!config.refreshToken) {
          console.error('❌ Refresh token not found. Please run auth flow first.');
          return;
        }
        // Refresh token is already set in constructor
        const calendarId = args[1] || config.calendarId || 'primary';
        console.log(`\n📅 Fetching events from calendar: ${calendarId}`);

        const events = await ingestor.fetchEvents(calendarId);
        console.log(`\n✅ Found ${events.length} events:`);

        for (const event of events) {
          console.log(`\n📋 ${event.title.en}`);
          console.log(`   📅 ${event.start} - ${event.end}`);
          console.log(`   🆔 ${event.event_id}`);
          if (event.location?.name?.en) {
            console.log(`   📍 ${event.location.name.en}`);
          }
          if (event.description?.en) {
            console.log(`   📄 ${event.description.en.substring(0, 100)}...`);
          }
        }
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run main function with proper error handling
main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
