# Wix Events API Integration - Lessons Learned

**Project:** NEFB (Nonprofits Events Fanout Bridge)
**Branch:** `temp/arch-spike-wix-sdk-auth`
**Duration:** 8+ hours over multiple sessions
**Status:** ✅ Successfully Completed

## Executive Summary

This document captures the key mistakes, discoveries, and lessons learned during our Wix Events API integration spike. **What started as a 2-hour authentication task became an 8-hour deep dive** due to fundamental misconceptions about Wix's authentication model.

**The Core Problem:** We spent 6+ hours trying wrong authentication methods before reading the documentation properly.

## 🚨 Critical Mistakes Made

### 1. **MAJOR ERROR: Wrong Authentication Method (6+ Hours Lost)**

**What We Did Wrong:**
```http
# INCORRECT: Used raw App Secret as Bearer token
Authorization: Bearer 9aa9ee96-cc56-4d00-8996-b7adff4a4dc3
wix-site-id: bec13d2a-00a6-420f-a780-e6f57663ab02
wix-instance-id: 75cee2d3-566f-4875-9757-558e2b577128
```

**What We Should Have Done:**
```http
# CORRECT: OAuth 2.0 client_credentials flow
POST https://www.wixapis.com/oauth2/token
{
  "grant_type": "client_credentials",
  "client_id": "efa507f6-bf43-4e7e-a023-34e9a7f719b9",
  "client_secret": "9aa9ee96-cc56-4d00-8996-b7adff4a4dc3",
  "instance_id": "5ef50f11-aebf-46d0-ab6e-59a516d914d3"
}

# Then use the returned access_token:
Authorization: Bearer <ACCESS_TOKEN>
```

**Why This Happened:**
- Started with "guess and test" approach instead of reading documentation
- Assumed API key authentication was simpler than OAuth
- LLM bias toward "demonstrating progress through code" over research

**Time Lost:** ~6 hours of guessing, testing headers, debugging errors

---

### 2. **CRITICAL ERROR: Wrong Instance ID Source (2+ Hours Lost)**

**What We Did Wrong:**
- Extracted `instanceId` from browser analytics tracking URLs
- Used `_uuid=75cee2d3-566f-4875-9757-558e2b577128` parameter
- Assumed this was the app instance ID

**What This Actually Was:**
- **Wix User ID**, not Instance ID
- From analytics tracking, not app installation
- Wrong identifier type entirely

**The Correct Approach:**
- Used `App Instance Installed` webhook to capture real instance ID
- Real instance ID: `5ef50f11-aebf-46d0-ab6e-59a516d914d3`
- From JWT payload: `instanceId` field (not `identity.wixUserId`)

**Why This Happened:**
- Manual extraction from browser dev tools is unreliable
- Confused user identity with app instance identity
- No systematic approach to credential discovery

**Time Lost:** ~2 hours debugging "APP_NOT_FOUND" errors

---

### 3. **Process ERROR: Action Before Research (Philosophy Issue)**

**What We Did Wrong:**
- Started coding and testing immediately
- "Move fast and build tools" mentality
- Avoided reading documentation until forced

**What We Should Have Done:**
- **Read official documentation first** for external APIs
- Understand authentication flow before implementation
- Research before guessing

**Why This Happened:**
- LLM tendency to prioritize visible action over research
- Assumption that all APIs work similarly
- Optimization for "demonstrating progress"

**Impact:** Multiplied debugging time by 3-4x

---

## 🔍 Technical Discovery Timeline

### Phase 1: Initial "Success" (Actually Failure)
- ✅ Found API endpoints
- ✅ Got 428 error (seemed like progress)
- ❌ **WRONG**: Thought we were "almost there"
- **Reality**: We weren't even using correct authentication

### Phase 2: Deep Debugging (Wasted Effort)
- Tried multiple header combinations
- Analyzed error JSON in detail
- Tested different API versions
- **Problem**: All built on wrong foundation

### Phase 3: HAR Analysis (Getting Closer)
- Analyzed real Wix dashboard network traffic
- Found internal API endpoints and XSRF tokens
- Discovered Wix's actual Events app ID
- **Issue**: Internal APIs not accessible externally

### Phase 4: Documentation Research (Breakthrough)
- **Finally read OAuth 2.0 documentation**
- Discovered token exchange requirement
- Understood client_credentials flow
- **Result**: Immediate progress toward solution

### Phase 5: Instance ID Discovery (Final Challenge)
- OAuth worked but returned "APP_NOT_FOUND"
- Realized instance ID was wrong type
- Implemented webhook to get real instance ID
- **Success**: Complete authentication working

---

## 🎯 Root Cause Analysis

### **Why The Mistakes Happened**

1. **Cognitive Bias: Action Over Research**
   - Felt pressure to show immediate progress
   - Coding feels more productive than reading
   - External APIs require different approach than internal development

2. **Pattern Matching Gone Wrong**
   - Applied previous API experience incorrectly
   - Assumed all APIs use simple Bearer token auth
   - Didn't recognize OAuth 2.0 requirements

3. **Tool Limitations**
   - Browser dev tools show tracking data, not app data
   - Manual extraction inherently unreliable
   - No systematic approach to credential discovery

4. **Documentation Avoidance**
   - Long documentation seems inefficient
   - Prefer "learning by doing"
   - Didn't recognize when guessing was failing

---

## 📚 Key Technical Lessons

### **About Wix Authentication**

1. **OAuth 2.0 is Required**
   - Wix uses proper OAuth 2.0 client_credentials flow
   - Access tokens expire after 4 hours
   - No shortcuts or simple API key auth

2. **Instance ID is Critical**
   - Must come from app installation process
   - Cannot be manually extracted from browser
   - Links specific app installation to specific site

3. **Webhook Infrastructure Needed**
   - `App Instance Installed` webhook captures real instance ID
   - Cloudflare Workers provide simple webhook hosting
   - JWT decoding required to extract instance ID

### **About API Integration Process**

1. **Documentation First for External APIs**
   - External APIs have different patterns than internal development
   - Authentication methods are non-negotiable
   - Understanding flow saves massive debugging time

2. **Systematic Credential Discovery**
   - Official installation processes over manual extraction
   - Webhook-based ID capture over browser inspection
   - Programmatic methods over manual methods

3. **Error Analysis Depth**
   - `MISSING_REQUEST_SITE_CONTEXT` = wrong auth method
   - `APP_NOT_FOUND` = wrong instance ID
   - Error messages are precise when understood correctly

---

## 🛠️ Process Improvements Applied

### **During This Spike**

1. **Created Documentation-First Rule**
   - Added Cursor rule: `.cursor/rules/core-rules/documentation-first-api-debugging-agent.mdc`
   - Enforces documentation reading before guessing
   - Prevents 6+ hour authentication debugging sessions

2. **Implemented Systematic Approach**
   - Webhook infrastructure for reliable credential capture
   - JWT decoding utilities for proper data extraction
   - Step-by-step verification of each authentication component

3. **Built Reusable Tools**
   - OAuth implementation with error handling
   - Webhook server for instance ID capture
   - Event creation with proper field validation

### **For Future API Integrations**

1. **Always Start With Documentation**
   - Read authentication section completely
   - Understand required credentials and flow
   - Identify webhook or installation requirements

2. **Use Official Methods**
   - Prefer SDK over direct REST when available
   - Use official installation processes
   - Follow documented patterns exactly

3. **Systematic Credential Discovery**
   - Document each credential and its source
   - Use programmatic methods over manual extraction
   - Verify each credential independently

---

## 💡 Broader Insights

### **About AI-Assisted Development**

1. **LLM Biases**
   - Tendency to prioritize action over research
   - Optimization for visible progress
   - Need explicit guidance toward documentation

2. **When to Override AI Suggestions**
   - External API authentication failures
   - Repeated similar errors with different approaches
   - When fundamental approach may be wrong

3. **Effective AI Collaboration**
   - Explicit instruction to read documentation first
   - Clear error when guessing isn't working
   - Force systematic approach over rapid iteration

### **About Technical Debt and Pressure**

1. **No Time Pressure is Liberating**
   - Allows proper research and understanding
   - Prevents shortcuts that create tech debt
   - Enables learning over quick fixes

2. **Failure is Valuable**
   - Deep understanding of why things fail
   - Creates robust solutions
   - Prevents similar mistakes in future

3. **Investment in Understanding**
   - 8 hours to fully understand > 2 hours with broken implementation
   - Comprehensive documentation saves future time
   - Knowledge compounds across similar integrations

---

## 📊 Success Metrics (After Fixing Approach)

### **OAuth Authentication**
- ✅ 100% success rate after implementing correct flow
- ✅ 4-hour token lifetime management
- ✅ Proper error handling and token refresh

### **Event Creation**
- ✅ Minimal required fields identified
- ✅ Successful event creation with all platforms
- ✅ Proper field validation and error handling

### **Instance ID Management**
- ✅ Webhook-based reliable instance ID capture
- ✅ JWT decoding for proper data extraction
- ✅ Automated credential management

---

## 🎯 Final Recommendations

### **For Similar External API Integrations**

1. **Start with complete documentation reading**
2. **Understand authentication flow before coding**
3. **Use official installation/setup processes**
4. **Build systematic testing infrastructure**
5. **Document every credential and its source**

### **For Team Development**

1. **Create "documentation first" rules for external APIs**
2. **Budget extra time for proper research phase**
3. **Recognize when guessing isn't working**
4. **Value understanding over speed for foundational integrations**

### **For Future Self**

1. **This took 8 hours because we avoided 30 minutes of documentation reading**
2. **External APIs are different from internal development patterns**
3. **When in doubt, RTFM (Read The Manual) first**
4. **Systematic approaches scale better than clever shortcuts**

---

## 🏆 What We Actually Accomplished

Despite the mistakes, this spike was ultimately successful:

- ✅ **Complete Wix Events API integration working**
- ✅ **OAuth 2.0 authentication fully implemented**
- ✅ **Instance ID discovery process documented**
- ✅ **Event creation with all required fields**
- ✅ **Webhook infrastructure for production use**
- ✅ **Comprehensive testing and validation tools**
- ✅ **Process improvements to prevent similar issues**

**Most importantly: We learned how to do it right, not just how to make it work.**

---

*"The best time to plant a tree was 20 years ago. The second best time is now. The best time to read the documentation was before starting. The second best time is when you realize you're stuck."*
