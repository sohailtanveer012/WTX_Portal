# Progressive Web App (PWA) Setup Guide

This guide explains how to complete the PWA setup for the WTX Investor Portal.

## Files Created

1. **`public/manifest.json`** - Web app manifest file
2. **`public/sw.js`** - Service worker for offline functionality
3. **`index.html`** - Updated with PWA meta tags and manifest link
4. **`src/main.tsx`** - Service worker registration

## Required Steps

### 1. Create App Icons

You need to create two icon files and place them in the `public` directory:

- **`public/icon-192x192.png`** - 192x192 pixels icon
- **`public/icon-512x512.png`** - 512x512 pixels icon

#### How to create icons:

**Option 1: Using your existing logo**
1. Use an image editor (Photoshop, GIMP, online tools like https://www.iloveimg.com/resize-image)
2. Resize your WTX logo to 192x192 and 512x512 pixels
3. Save as PNG files
4. Place in `public/` directory

**Option 2: Using online tools**
- Visit https://realfavicongenerator.net/
- Upload your logo
- Generate all sizes
- Download and place in `public/` directory

**Option 3: Using command line (if you have ImageMagick installed)**
```bash
cd public
convert WTX-Logo.png -resize 192x192 icon-192x192.png
convert WTX-Logo.png -resize 512x512 icon-512x512.png
```

### 2. Test PWA Installation

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Preview locally:**
   ```bash
   npm run preview
   ```

3. **Test in browser:**
   - Open DevTools (F12)
   - Go to Application tab
   - Check "Service Workers" - should show registered
   - Check "Manifest" - should show your manifest
   - Check "Application" > "Storage" > "Cache Storage" - should show cached files

4. **Test installation:**
   - Open the app in Chrome/Edge (on desktop or mobile)
   - Look for the install prompt or "+" icon in address bar
   - Click "Install" to add to home screen
   - App should open in standalone mode

### 3. Deploy to Production

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting (Vercel, Netlify, etc.)

3. **Important:** Ensure your hosting serves the service worker with proper headers:
   - `Content-Type: application/javascript`
   - Service worker must be served over HTTPS (or localhost)

### 4. Verify PWA Features

After deployment, verify:
- ✅ App can be installed on mobile/desktop
- ✅ App works offline (basic functionality)
- ✅ Icons appear correctly
- ✅ Manifest is accessible at `/manifest.json`
- ✅ Service worker is registered and active

## Features Enabled

1. **Installable** - Users can install the app on their device
2. **Offline Support** - Basic offline functionality via service worker
3. **App-like Experience** - Opens in standalone mode when installed
4. **Push Notifications** - Service worker ready for push notifications (if you add them later)
5. **Update Notifications** - App notifies users when updates are available

## Customization

### Update App Name/Description

Edit `public/manifest.json`:
- `name` - Full app name
- `short_name` - Short name for home screen
- `description` - App description
- `theme_color` - Theme color (should match your app's primary color)
- `background_color` - Background color (used when app is loading)

### Update Service Worker Cache

Edit `public/sw.js`:
- Change `CACHE_NAME` version when you want to force cache refresh
- Modify `urlsToCache` to cache additional resources
- Customize fetch strategies for different resources

### Disable Service Worker (if needed)

If you need to disable the service worker:
1. Remove or comment out the service worker registration in `src/main.tsx`
2. Remove the `sw.js` file from `public/`
3. Update `index.html` to remove service worker references

## Troubleshooting

### Icons not showing
- Ensure icons are PNG format
- Check file paths are correct
- Verify icons are in `public/` directory (will be copied to `dist/` on build)

### Service worker not registering
- Check browser console for errors
- Ensure app is served over HTTPS (or localhost)
- Verify `sw.js` is accessible at `/sw.js`

### App not installable
- Check manifest.json is valid (use Chrome DevTools > Application > Manifest)
- Ensure icons are present and correct sizes
- Verify `start_url` is correct
- Check HTTPS is enabled

### Cache issues
- Clear browser cache and service worker
- Update `CACHE_NAME` version in `sw.js`
- Unregister service worker: DevTools > Application > Service Workers > Unregister

## Next Steps (Optional)

1. **Add offline page** - Create a custom offline fallback page
2. **Implement push notifications** - Add backend support for push notifications
3. **Add background sync** - Sync data when connection is restored
4. **Optimize caching strategy** - Implement different caching strategies for different resources
5. **Add update prompts** - Show user-friendly update notifications

