# Public Folder - Static Assets

This folder contains static assets that are served directly by Next.js.

## What Should Be Here

### Essential Files (Missing - Need to Create)

1. **favicon.ico** - Browser tab icon
   - Should be 32x32 or 16x16 pixels
   - Currently referenced in middleware.ts

2. **og-image.png** - Open Graph image for social sharing
   - Should be 1200x630 pixels
   - Referenced in `app/layout.tsx` and `app/page.tsx`
   - Used when sharing links on social media

3. **manifest.json** - PWA manifest (for installable app)
   - Referenced in optimization roadmap
   - Needed for Progressive Web App features

4. **robots.txt** - Search engine crawler instructions
   - Optional but recommended for SEO

5. **sitemap.xml** - Site structure for search engines
   - Optional but recommended for SEO

### Optional Files

- **apple-touch-icon.png** - iOS home screen icon (180x180)
- **icon-192.png** - PWA icon (192x192)
- **icon-512.png** - PWA icon (512x512)
- **offline.html** - Offline fallback page (for PWA)

## Current Status

❌ **Empty** - All essential files are missing!

## Next Steps

1. Create favicon.ico
2. Create og-image.png (1200x630)
3. Create manifest.json for PWA
4. Add robots.txt
5. Add PWA icons

See `PUBLIC_FOLDER_SETUP.md` for detailed instructions.

