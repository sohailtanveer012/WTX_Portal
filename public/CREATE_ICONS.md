# Creating PWA Icons

You need to create two icon files for the PWA:

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

## Quick Steps

### Option 1: Using Online Tools (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload your `WTX-Logo.png` from `src/assets/`
3. Generate favicons and app icons
4. Download the package
5. Extract and place these files in `public/`:
   - `icon-192x192.png`
   - `icon-512x512.png`

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd wtx-investor-portal/public
convert ../src/assets/WTX-Logo.png -resize 192x192 -background transparent icon-192x192.png
convert ../src/assets/WTX-Logo.png -resize 512x512 -background transparent icon-512x512.png
```

### Option 3: Using Photoshop/GIMP

1. Open `src/assets/WTX-Logo.png`
2. Create a new image with transparent background:
   - Size: 192x192 pixels for small icon
   - Size: 512x512 pixels for large icon
3. Resize and center your logo
4. Export as PNG
5. Place in `public/` directory

### Option 4: Using Online Image Resizer

1. Go to https://www.iloveimg.com/resize-image
2. Upload `WTX-Logo.png`
3. Resize to 192x192, save as `icon-192x192.png`
4. Resize to 512x512, save as `icon-512x512.png`
5. Place both files in `public/` directory

## Verify Icons

After creating icons:

1. Check files exist in `public/`:
   ```bash
   ls -la public/icon-*.png
   ```

2. Build and test:
   ```bash
   npm run build
   npm run preview
   ```

3. Check in browser DevTools:
   - Application > Manifest > Icons should show your icons
   - Application > Service Workers should show registered

## Notes

- Icons should be PNG format
- Icons should have transparent or solid backgrounds
- Icons will be displayed on home screens when app is installed
- Larger icons (512x512) are used for Android, smaller (192x192) for iOS

