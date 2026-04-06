# 📦 NPM Scripts Guide

Quick reference for all available npm scripts in this project.

---

## 🚀 Development Scripts

### `npm run dev`
**Normal development mode**
```bash
npm run dev
```
- Starts Next.js dev server on http://localhost:3000
- Hot reload enabled
- Use this 95% of the time
- **When:** Regular daily development

---

### `npm run dev:clean`
**Clean cache + dev mode**
```bash
npm run dev:clean
```
- Deletes `.next` folder
- Starts fresh dev server
- **When to use:**
  - After switching git branches
  - After `npm install`
  - After changing `.env.local`
  - When seeing weird errors
  - When components aren't updating

---

### `npm run dev:turbo`
**Turbopack mode (experimental)**
```bash
npm run dev:turbo
```
- Uses Next.js Turbopack (faster builds)
- Experimental feature
- **When:** Testing new build performance

---

## 🛠️ Maintenance Scripts

### `npm run cache:clear`
**Just clear cache (don't start server)**
```bash
npm run cache:clear
```
- Deletes `.next` folder only
- Doesn't start server
- **When:** Want to clear cache before doing something else

---

### `npm run clean:all`
**Nuclear option - clear everything**
```bash
npm run clean:all
```
- Deletes `.next`, `node_modules`, `.turbo`
- **When:**
  - Really stuck with build errors
  - Before fresh install
  - Switching Node versions
  - Disk cleanup

---

### `npm run fresh:install`
**Complete fresh start**
```bash
npm run fresh:install
```
- Deletes `.next`, `node_modules`, `package-lock.json`
- Reinstalls all dependencies
- Takes 2-3 minutes
- **When:**
  - Dependency conflicts
  - Corrupted node_modules
  - After major package updates
  - "Nothing else worked" situation

---

## 🏗️ Build Scripts

### `npm run build`
**Production build**
```bash
npm run build
```
- Creates optimized production build
- Required before deployment
- **When:**
  - Testing production build locally
  - Before deploying

---

### `npm run start`
**Run production build**
```bash
npm run start
```
- Runs the production build (after `npm run build`)
- **When:**
  - Testing production mode locally
  - After running `npm run build`

---

### `npm run analyze`
**Analyze bundle size**
```bash
npm run analyze
```
- Builds project with bundle analyzer
- Opens visualization in browser
- **When:**
  - Optimizing bundle size
  - Finding large dependencies
  - Performance optimization

---

## 🧪 Testing & Quality Scripts

### `npm run lint`
**Run ESLint**
```bash
npm run lint
```
- Checks code for errors
- **When:**
  - Before committing
  - Fixing code quality issues

---

### `npm run type-check`
**TypeScript type checking**
```bash
npm run type-check
```
- Checks TypeScript types without building
- Faster than full build
- **When:**
  - Checking for type errors
  - Before committing
  - CI/CD pipeline

---

### `npm run lighthouse`
**Performance audit**
```bash
npm run lighthouse
```
- Runs Google Lighthouse audit
- Tests performance, accessibility, SEO
- **Requires:** Dev server running on port 3000
- **When:**
  - Checking performance
  - Before deployment
  - Optimizing page speed

---

## 🗄️ Database Scripts

### `npm run seed:workouts`
**Seed workout programs**
```bash
npm run seed:workouts
```
- Populates database with 3 workout programs
- Includes exercises and workouts
- **When:**
  - First time setup
  - Resetting workout data
  - Development testing

---

## 🔥 Common Workflows

### **Start New Feature**
```bash
git checkout -b feature/my-feature
npm run dev:clean
```

### **Pull Latest Changes**
```bash
git pull
npm install
npm run dev:clean
```

### **Fix Weird Build Errors**
```bash
npm run dev:clean
# If still broken:
npm run fresh:install
```

### **Before Deploying**
```bash
npm run type-check
npm run lint
npm run build
npm run lighthouse
```

### **Performance Check**
```bash
npm run analyze
npm run lighthouse
```

### **After Installing Packages**
```bash
npm install stripe
npm run dev:clean
```

### **Switching Branches**
```bash
git checkout main
npm run dev:clean
```

---

## ⚡ Quick Reference Table

| Command | Speed | What It Does | When to Use |
|---------|-------|-------------|-------------|
| `dev` | ⚡ Fast | Normal dev server | Daily work |
| `dev:clean` | 🐌 Slow (30s) | Clear cache + start | After changes |
| `cache:clear` | ⚡ Instant | Delete .next only | Manual cleanup |
| `clean:all` | ⚡ Instant | Delete everything | Before fresh install |
| `fresh:install` | 🐌 Very slow (2-3m) | Complete reset | Last resort |
| `build` | 🐌 Slow (1-2m) | Production build | Before deploy |
| `analyze` | 🐌 Slow (1-2m) | Bundle analysis | Optimization |
| `type-check` | ⚡ Fast | Check types | Before commit |

---

## 🎯 Decision Tree

```
Having issues? 🤔
├─ Changed .env or installed package?
│  └─ Run: npm run dev:clean
│
├─ Switched git branches?
│  └─ Run: npm run dev:clean
│
├─ Seeing 404 errors for JS files?
│  └─ Run: npm run dev:clean
│
├─ Components not updating?
│  └─ Run: npm run dev:clean
│
├─ Still broken after dev:clean?
│  └─ Run: npm run fresh:install
│
└─ Just regular development?
   └─ Run: npm run dev
```

---

## 💡 Pro Tips

1. **Alias for dev:clean** (add to your shell config):
   ```bash
   alias ndc="npm run dev:clean"
   ```

2. **VS Code Task** (`.vscode/tasks.json`):
   ```json
   {
     "label": "Dev Clean",
     "type": "npm",
     "script": "dev:clean"
   }
   ```

3. **Git Hook** (auto-clean on checkout):
   ```bash
   # .git/hooks/post-checkout
   npm run cache:clear
   ```

4. **Weekly Cleanup**:
   ```bash
   # Every Monday morning
   npm run clean:all
   npm install
   ```

---

## 🆘 Troubleshooting

### "Port 3000 already in use"
```bash
# Kill existing process
pkill -f "next dev"
npm run dev
```

### "Module not found" but file exists
```bash
npm run dev:clean
```

### "Cannot find module 'X'" after npm install
```bash
npm run fresh:install
```

### TypeScript errors that shouldn't exist
```bash
npm run cache:clear
npm run type-check
```

### Everything is broken
```bash
npm run fresh:install
# Wait 2-3 minutes
npm run dev
```

---

## 📚 More Resources

- [Next.js CLI Docs](https://nextjs.org/docs/app/api-reference/next-cli)
- [npm Scripts Docs](https://docs.npmjs.com/cli/v9/using-npm/scripts)
- [Turbopack Docs](https://nextjs.org/docs/architecture/turbopack)

---

**💾 Save this file!** Keep it handy for when you need it.

*Last updated: 2026-02-02*

