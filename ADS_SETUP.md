# Google AdSense Setup Guide

This document explains how to set up Google AdSense for the JSON Formatter application.

## Step 1: Get Your AdSense Account

1. Sign up for Google AdSense at https://www.google.com/adsense
2. Complete the verification process
3. Get your **Publisher ID** (looks like `ca-pub-XXXXXXXXXXXXXXXX`)

## Step 2: Update index.html

Open `index.html` and replace `YOUR_ADSENSE_CLIENT_ID` with your actual AdSense client ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ACTUAL_CLIENT_ID"
 crossorigin="anonymous"></script>
```

Example:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
 crossorigin="anonymous"></script>
```

## Step 3: Create Ad Units in AdSense Dashboard

1. Go to your AdSense dashboard
2. Navigate to **Ads** → **By ad unit**
3. Click **Create ad unit**
4. Create the following ad units:

### Ad Unit 1: Top Banner
- **Name**: JSON Formatter Top Banner
- **Size**: Responsive (or 728x90 Leaderboard)
- **Type**: Display ads

### Ad Unit 2: Bottom Banner
- **Name**: JSON Formatter Bottom Banner
- **Size**: Responsive (or 728x90 Leaderboard)
- **Type**: Display ads

### Ad Unit 3: Side Skyscraper (for split mode)
- **Name**: JSON Formatter Side
- **Size**: 160x600 Wide Skyscraper
- **Type**: Display ads

## Step 4: Get Ad Slot IDs

After creating each ad unit, you'll get an **Ad Slot ID** (looks like `1234567890`).

## Step 5: Update JsonFormatter.jsx

Open `src/pages/JsonFormatter.jsx` and replace the placeholder ad slot IDs:

```jsx
// Top Banner
<GoogleAd 
  adSlot="YOUR_ACTUAL_TOP_BANNER_AD_SLOT_ID"
  style={{ display: 'block', width: '100%', height: '90px' }}
  adFormat="horizontal"
/>

// Side Skyscraper
<GoogleAd 
  adSlot="YOUR_ACTUAL_SIDE_SKYSCRAPER_AD_SLOT_ID"
  style={{ display: 'block', width: '160px', height: '600px' }}
  adFormat="vertical"
/>

// Bottom Banner
<GoogleAd 
  adSlot="YOUR_ACTUAL_BOTTOM_BANNER_AD_SLOT_ID"
  style={{ display: 'block', width: '100%', height: '90px' }}
  adFormat="horizontal"
/>
```

## Step 6: Test Your Implementation

1. Run the development server: `npm run dev`
2. Open http://localhost:5173
3. You should see placeholder boxes where ads will appear
4. When you deploy with real ad IDs, ads will load

## Important Notes

- **AdSense Policy**: Make sure your site complies with Google AdSense policies
- **First Request**: Google reviews your first ad request (may take 1-2 weeks)
- **Ad Blocking**: Ads won't show if the user has an ad blocker
- **Responsive**: The component supports responsive ads
- **Placeholder**: Shows a placeholder when ad slot is not configured

## Troubleshooting

### Ads not showing?
1. Check browser console for errors
2. Verify your client ID and ad slot IDs are correct
3. Ensure your domain is approved in AdSense
4. Check if adsbygoogle.js is loading in Network tab

### "Google AdSense not loaded" warning?
This is normal in development. The warning disappears when the script loads from your domain.

## Customization

You can add more ad placements by using the `<GoogleAd />` component anywhere in your app:

```jsx
import GoogleAd from '@/components/GoogleAd';

// In your component:
<GoogleAd 
  adSlot="YOUR_AD_SLOT_ID"
  style={{ display: 'block', width: '300px', height: '250px' }}
  adFormat="rectangle"
/>
```

Available ad formats:
- `auto` - Automatic sizing (default)
- `horizontal` - Wide banners
- `vertical` - Tall skyscrapers
- `rectangle` - Square/rectangular ads
