# Offline Development Guide

## 🎯 **Goal: 100% Offline Development**

This project is configured to work completely offline after initial setup, avoiding the confusing "hanging compiler" issues common with modern Node.js tooling.

## 📥 **One-Time Setup (Requires Internet)**

```bash
# 1. Install all dependencies explicitly
npm run setup  # or: npm install

# 2. Verify everything is available offline
npm run verify-offline
```

**Output should show:**
```
✅ All tools available offline
Version 5.9.2
tsx v4.20.3
node v24.3.0
```

## 🔧 **Development Commands (100% Offline)**

### **Building & Type Checking**
```bash
npm run build         # Compile TypeScript → ./dist/
npm run build:watch   # Compile with file watching
npm run type-check    # Check types without emitting files
```

### **Running & Testing**
```bash
npm run dev auth      # Run CLI auth command
npm run dev fetch     # Run CLI fetch command
npm run test          # Run test suite
npm run lint          # Run ESLint
```

### **Utilities**
```bash
npm run clean         # Remove ./dist/ directory
npm run verify-offline # Check all tools work offline
```

## 🚫 **AVOID These Commands (They Download from Internet)**

```bash
# ❌ These may download tools on-demand:
npx tsc              # Downloads TypeScript if not global
npx tsx              # Downloads tsx if not global
npx eslint           # Downloads ESLint if not global

# ✅ Use these instead:
npm run build        # Uses local TypeScript
npm run dev          # Uses local tsx
npm run lint         # Uses local ESLint
```

## 🛠️ **How This Works**

### **Explicit Local Paths**
All scripts use explicit paths to local binaries:
```json
{
  "scripts": {
    "build": "./node_modules/.bin/tsc",     // ← Local TypeScript
    "dev": "./node_modules/.bin/tsx",       // ← Local tsx
    "lint": "./node_modules/.bin/eslint"    // ← Local ESLint
  }
}
```

### **No npx Dependencies**
- **Old approach**: `npx tsc` → may download from internet
- **New approach**: `./node_modules/.bin/tsc` → always local

### **Explicit devDependencies**
All tools are explicitly listed in `package.json`:
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",    // ← TypeScript compiler
    "tsx": "^4.0.0",           // ← TypeScript execution
    "eslint": "^8.0.0",        // ← Linting
    "@types/node": "^20.0.0"   // ← Node.js types
  }
}
```

## 🌐 **Offline Development Benefits**

### **Predictable Performance**
- **Compilation**: Always same speed (no network delays)
- **Startup time**: Instant (no download checks)
- **Reliability**: Works on planes, coffee shops, etc.

### **Clear Separation of Concerns**
1. **Setup phase**: `npm install` (requires internet)
2. **Development phase**: All npm scripts (offline)

### **Traditional Developer Experience**
- **No surprises**: Tools behave like traditional compilers
- **Clear dependencies**: Everything explicit in package.json
- **Debuggable**: Easy to see which version of each tool

## 🔍 **Troubleshooting**

### **"Command not found" Errors**
```bash
# If you see: ./node_modules/.bin/tsc: No such file
npm run setup  # Reinstall dependencies
```

### **Hanging Issues**
```bash
# If commands hang, verify you're using npm scripts:
npm run build      # ✅ Good
npx tsc           # ❌ May hang downloading
```

### **Version Verification**
```bash
# Check what versions are installed:
npm run verify-offline

# Check specific tool:
./node_modules/.bin/tsc --version
./node_modules/.bin/tsx --version
```

## 📚 **Old School vs Modern Comparison**

| Aspect | Traditional (C/Make) | Modern Node.js (npx) | Our Approach |
|--------|---------------------|---------------------|--------------|
| **Dependencies** | Explicit install | Download on-demand | Explicit install |
| **Offline work** | ✅ Always | ❌ May fail | ✅ Always |
| **Performance** | Predictable | Variable | Predictable |
| **Debugging** | Clear paths | Opaque | Clear paths |

## 🎯 **Development Workflow**

### **Initial Project Setup**
```bash
git clone <repo>
cd nonprofits-events-fanout-bridge
npm run setup                    # One-time: download all tools
npm run verify-offline          # Confirm offline readiness
```

### **Daily Development** (No Internet Required)
```bash
npm run build                   # Compile TypeScript
npm run dev auth               # Test OAuth flow
npm run type-check             # Verify types
npm run test                   # Run tests
npm run lint                   # Check code style
```

### **Before Deployment**
```bash
npm run clean                  # Clear old builds
npm run build                  # Fresh compilation
npm run test                   # Verify all tests pass
```

This approach provides the **reliability and predictability** of traditional development tools while working with modern TypeScript/Node.js ecosystem.
