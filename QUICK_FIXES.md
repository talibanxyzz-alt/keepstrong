# 🚨 Quick Fixes Cheatsheet

**Print this and keep it near your desk!**

---

## 🔥 Most Common Issues

### ❌ **404 Errors for JS Files**
```bash
npm run dev:clean
```

### ❌ **Components Not Updating**
```bash
npm run dev:clean
```

### ❌ **After `git pull` or `git checkout`**
```bash
npm run dev:clean
```

### ❌ **After `npm install`**
```bash
npm run dev:clean
```

### ❌ **After Changing `.env.local`**
```bash
# Stop server (Ctrl+C), then:
npm run dev:clean
```

### ❌ **"Module not found" (but file exists)**
```bash
npm run dev:clean
```

### ❌ **Weird TypeScript Errors**
```bash
npm run dev:clean
```

### ❌ **Still Broken After `dev:clean`?**
```bash
npm run fresh:install
# Wait 2-3 minutes
```

### ❌ **"Port 3000 already in use"**
```bash
pkill -f "next dev"
npm run dev
```

---

## ✅ Daily Workflow

```bash
# Morning - start work
npm run dev

# After git operations
Ctrl+C
git pull
npm run dev:clean

# After installing packages
Ctrl+C
npm install <package>
npm run dev:clean

# End of day
Ctrl+C  # Always stop properly!
```

---

## 🎯 Golden Rules

1. ✅ Always use `Ctrl+C` to stop (never `Ctrl+Z`)
2. ✅ Run `dev:clean` after git operations
3. ✅ Run `dev:clean` after installing packages
4. ✅ When in doubt, `dev:clean` it out!

---

## 📞 Emergency Hotline

```bash
# Level 1: Quick fix (try this first)
npm run dev:clean

# Level 2: Nuclear option (if Level 1 fails)
npm run fresh:install

# Level 3: Burn it all (if Level 2 fails)
rm -rf .next node_modules package-lock.json .turbo
npm install
npm run dev
```

---

**💡 Remember:** `npm run dev:clean` solves 90% of Next.js issues!

---

*Keep this handy! 📌*

