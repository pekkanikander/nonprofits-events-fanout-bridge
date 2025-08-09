import { google } from 'googleapis';
import { Event, EventSchema, generateEventId } from '../core/model.js';

export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
}

export class GoogleCalendarIngestor {
  private oauth2Client: any;
  private calendar: any;

  constructor(config: GoogleCalendarConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  // Generate OAuth2 authorization URL
  getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<{ access_token: string; refresh_token?: string }> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  // Fetch events from a calendar
  async fetchEvents(calendarId: string, timeMin?: string, timeMax?: string): Promise<Event[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events: Event[] = [];

      for (const gcalEvent of response.data.items || []) {
        const event = this.normalizeGCalEvent(gcalEvent, calendarId);
        if (event) {
          events.push(event);
        }
      }

      return events;
    } catch (error) {
      console.error('Error fetching events from Google Calendar:', error);
      throw error;
    }
  }

  // Normalize Google Calendar event to our Event model
  private normalizeGCalEvent(gcalEvent: any, tenantId: string): Event | null {
    if (!gcalEvent.start || !gcalEvent.summary) {
      return null;
    }

    // Handle different date formats from Google Calendar
    let start: string;
    let end: string;
    let allday = false;

    if (gcalEvent.start.dateTime) {
      // Timed event
      start = gcalEvent.start.dateTime;
      end = gcalEvent.end?.dateTime || start;
    } else if (gcalEvent.start.date) {
      // All-day event
      allday = true;
      start = `${gcalEvent.start.date}T00:00:00.000Z`;
      end = gcalEvent.end?.date ? `${gcalEvent.end.date}T23:59:59.999Z` : start;
    } else {
      console.warn('Invalid event start time:', gcalEvent.start);
      return null;
    }

    const event: Event = {
      event_id: generateEventId(tenantId, gcalEvent.summary, start),
      title: { en: gcalEvent.summary },
      description: gcalEvent.description ? { en: gcalEvent.description } : undefined,
      start,
      end,
      allday,
      status: gcalEvent.status || 'confirmed',
      location: gcalEvent.location ? {
        name: { en: gcalEvent.location },
        address: gcalEvent.location
      } : undefined,
      organizer: {
        name: gcalEvent.organizer?.displayName || 'Unknown',
        email: gcalEvent.organizer?.email
      },
      price: { currency: 'EUR', amount: 0 },
      tags: [],
      accessibility: [],
      images: [],
      updated_at: gcalEvent.updated || new Date().toISOString()
    };

    // Validate the event
    const result = EventSchema.safeParse(event);
    if (!result.success) {
      console.warn('Invalid event data:', result.error);
      return null;
    }

    return result.data;
  }
}
