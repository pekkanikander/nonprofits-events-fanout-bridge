# Facebook API Lessons Learned

## Overview
This document captures verified findings and observations from the Facebook/Instagram API integration spike for the Nonprofits Events Fanout Bridge project.

## Critical Breakthrough: App Creation Strategy

### The Problem
- **Use Case-Based App Creation**: Facebook's new app creation process restricts permissions based on selected use cases
- **"Manage Everything on your Page" Use Case**: Only provides `pages_show_list` and `business_management` permissions
- **Missing Critical Permissions**: Cannot access `pages_read_engagement` or `pages_manage_posts` needed for event posting

### The Solution: "Other" App Creation Path
- **Bypass Use Case Restrictions**: Choose "Create New App" → "Other" → "Business"
- **Access Old Experience**: "Other" option provides access to the legacy app creation interface
- **Full Permission Selection**: All available permissions become selectable, including:
  - `pages_show_list` ✅
  - `pages_read_engagement` ✅ (Critical for reading page details)
  - `pages_manage_posts` ✅ (Critical for posting events)
  - `instagram_basic` ✅ (Instagram integration)

## Technical Implementation Requirements

### Token Types and Usage
- **User Access Token**: Required for reading page information and obtaining page tokens
- **Page Access Token**: Required for actually posting to pages
- **Token Exchange Process**: Use User Token to call `/me/accounts` endpoint, then extract `access_token` from page data

### Required API Endpoints
```javascript
// Get accessible pages
GET /me/accounts?access_token={USER_TOKEN}

// Get page access token
GET /{page-id}?fields=access_token&access_token={USER_TOKEN}

// Post to page
POST /{page-id}/feed?access_token={PAGE_TOKEN}
```

### Permission Requirements
- **Minimum Required**: `pages_read_engagement` + `pages_manage_posts`
- **Admin Access**: Page Access Token must have admin privileges on the target page
- **App Review**: Permissions may require Facebook app review for production use

## Working Test Implementation

### Test Scripts Created
- `spike/fb/get-real-page-token.js` - Exchanges User Token for Page Token
- `spike/fb/test-facebook-page-posting-final.js` - Tests actual posting to Facebook pages
- `spike/fb/check-page-token-permissions.js` - Verifies token capabilities

### Successful Test Results
- ✅ **Page Access**: Successfully read page details (name, category, verification status)
- ✅ **Post Creation**: Successfully created posts with Post ID format: `{page-id}_{post-id}`
- ✅ **Post Verification**: Successfully read back created posts with message and timestamp

## Facebook App Configuration

### Required Products
- **Webhooks**: For receiving page updates (configured with `/fb` endpoint)
- **Facebook Login for Business**: For user authentication (requires advanced access)
- **Instagram**: For cross-platform posting (requires Instagram account)

### Webhook Configuration
- **Callback URL**: `https://{worker}.{subdomain}.workers.dev/fb`
- **Verify Token**: Custom token for webhook verification
- **Product**: Page (for page-related webhooks)

## What We Don't Know

### Production Limitations
- **App Review Process**: Whether these permissions require Facebook app review
- **Rate Limits**: API call limits for page posting
- **Business Verification**: Whether business verification affects permission availability

### Instagram Integration
- **Cross-Posting**: Whether Instagram posts can be created via Facebook API
- **Account Requirements**: Whether Instagram Business account is required

## Lessons for Future Development

### App Creation Strategy
1. **Always choose "Other"** when creating Facebook apps to bypass use case restrictions
2. **Select "Business"** app type for nonprofit/event management use cases
3. **Verify permissions** in Graph API Explorer before proceeding with development

### Token Management
1. **Maintain both token types**: User Token for reading, Page Token for posting
2. **Use token exchange pattern**: User Token → Page Token for each target page
3. **Verify admin access**: Ensure Page Access Token has sufficient privileges

### Testing Approach
1. **Test token capabilities** before attempting posting operations
2. **Use unpublished posts** during development (if supported)
3. **Verify post creation** by reading back created content

---

*Document created during Facebook API spike on August 9-10, 2025*
*Contains only verified facts and repeatable technical details*
