# How to Add Your Logo - Quick Guide

## Step-by-Step Instructions

### Option 1: Using File Manager (Easiest)

1. **Locate your logo image file** on your computer
   - It should be a PNG, SVG, or WebP file
   - Recommended: PNG with transparent background
   - Recommended size: 512x512 pixels or larger

2. **Copy the logo file** to the project's `public` folder:
   ```
   /home/horus/Downloads/glp_1/public/logo.png
   ```

3. **Rename it to `logo.png`** (if it has a different name)
   - The file must be named exactly: `logo.png`
   - Or `logo.svg` if using SVG format

4. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

5. **Check the app** - The logo should now appear in:
   - Sidebar (desktop & mobile)
   - Landing page header
   - Landing page footer

---

### Option 2: Using Terminal

1. **Navigate to the public folder:**
   ```bash
   cd /home/horus/Downloads/glp_1/public
   ```

2. **Copy your logo file:**
   ```bash
   # If your logo is on Desktop:
   cp ~/Desktop/your-logo.png ./logo.png
   
   # Or if it's in Downloads:
   cp ~/Downloads/your-logo.png ./logo.png
   
   # Or if it's in a specific location:
   cp /path/to/your/logo.png ./logo.png
   ```

3. **Verify the file exists:**
   ```bash
   ls -la logo.png
   ```

4. **Restart dev server:**
   ```bash
   cd ..
   npm run dev
   ```

---

### Option 3: Using VS Code / Cursor

1. **Open the `public` folder** in your editor
2. **Right-click** in the `public` folder
3. **Select "New File"** or drag your logo file into the folder
4. **Name it `logo.png`**
5. **Restart dev server**

---

## File Requirements

### Supported Formats:
- ✅ **PNG** (recommended) - `/public/logo.png`
- ✅ **SVG** (best for scalability) - `/public/logo.svg`
- ✅ **WebP** (modern format) - `/public/logo.webp`

### Recommended Specifications:
- **Size**: 512x512 pixels minimum (for high-resolution displays)
- **Background**: Transparent (PNG with alpha channel)
- **Aspect Ratio**: Square (1:1)
- **File Size**: Under 200KB (for fast loading)

---

## Troubleshooting

### Logo Not Showing?

1. **Check file name:**
   - Must be exactly `logo.png` (case-sensitive)
   - Not `Logo.png` or `LOGO.PNG`

2. **Check file location:**
   - Must be in `/public/logo.png`
   - Not in `/public/images/logo.png` or other subfolder

3. **Check file format:**
   - PNG, SVG, or WebP only
   - Not JPG, GIF, or other formats

4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

5. **Hard refresh browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

6. **Check browser console:**
   - Open DevTools (F12)
   - Look for image loading errors

### Fallback Behavior

If the logo file is not found, the app will automatically show:
- A blue square with a white "K" letter
- This ensures the app always displays something

---

## Quick Test

After adding your logo:

1. **Check sidebar** - Logo should appear in the top-left
2. **Check mobile header** - Logo should appear in mobile view
3. **Check landing page** - Logo should appear in header and footer

---

## Example File Structure

After adding your logo, your `public` folder should look like:

```
public/
├── logo.png          ← Your logo file (NEW)
├── manifest.json
├── README.md
└── robots.txt
```

---

## Need Help?

If you're having trouble:
1. Make sure the file is named exactly `logo.png`
2. Make sure it's in the `public` folder (not a subfolder)
3. Restart the dev server
4. Clear browser cache (hard refresh)

The logo will automatically appear once the file is in the correct location!

