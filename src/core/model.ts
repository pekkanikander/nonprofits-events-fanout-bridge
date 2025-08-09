import { z } from 'zod';

// Core Event model as defined in DESIGN.md
export const EventSchema = z.object({
  event_id: z.string(),
  slug: z.string().optional(),
  title: z.record(z.string(), z.string()), // i18n map
  description: z.record(z.string(), z.string()).optional(),
  start: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime string"
  }),
  end: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime string"
  }),
  allday: z.boolean().default(false),
  status: z.enum(['confirmed', 'cancelled', 'tentative']).default('confirmed'),
  location: z.object({
    name: z.record(z.string(), z.string()).optional(),
    address: z.string().optional(),
    geo: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  online_url: z.string().url().optional(),
  registration_url: z.string().url().optional(),
  price: z.object({
    currency: z.string().default('EUR'),
    amount: z.number().default(0)
  }).default({ currency: 'EUR', amount: 0 }),
  organizer: z.object({
    name: z.string(),
    email: z.string().email().optional()
  }),
  cover_image: z.object({
    src: z.string().url(),
    alt: z.record(z.string(), z.string()) // i18n map
  }).optional(),
  images: z.array(z.object({
    src: z.string().url(),
    alt: z.record(z.string(), z.string()), // i18n map
    caption: z.record(z.string(), z.string()).optional()
  })).default([]),
  tags: z.array(z.string()).default([]),
  accessibility: z.array(z.string()).default([]),
  updated_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid datetime string"
  })
});

export type Event = z.infer<typeof EventSchema>;

// Helper function to generate deterministic event_id
export function generateEventId(tenantId: string, title: string, start: string): string {
  // Extract timezone from datetime string if present
  const timezone = extractTimezoneFromDateTime(start);
  const normalized = `${tenantId}|${title.toLowerCase().trim()}|${start}|${timezone}`;
  // Simple hash for now - in production, use crypto.createHash('sha256')
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Helper function to extract timezone from datetime string
function extractTimezoneFromDateTime(datetime: string): string {
  // Check for timezone offset in format +03:00 or -05:00
  const timezoneMatch = datetime.match(/[+-]\d{2}:\d{2}$/);
  if (timezoneMatch) {
    return timezoneMatch[0];
  }

  // Check for 'Z' suffix (UTC)
  if (datetime.endsWith('Z')) {
    return 'Z';
  }

  // Default to UTC if no timezone found
  return 'Z';
}
