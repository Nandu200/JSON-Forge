import { useEffect, useRef } from 'react';

/**
 * Google AdSense Ad Component
 * 
 * Usage:
 * <GoogleAd 
 *   adSlot="YOUR_AD_SLOT_ID" 
 *   style={{ display: 'block', width: '100%', height: '250px' }}
 * />
 * 
 * Note: Make sure to replace YOUR_ADSENSE_CLIENT_ID in index.html
 * and YOUR_AD_SLOT_ID when using this component.
 */
export default function GoogleAd({ 
  adSlot, 
  style = {}, 
  adFormat = 'auto',
  fullWidthResponsive = true 
}) {
  const adRef = useRef(null);
  const adsEnabled = import.meta.env.VITE_ADS_ENABLED !== 'false';
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT;

  useEffect(() => {
    if (!adsEnabled || typeof window === 'undefined') return;
    
    // Check if adsbygoogle is loaded
    if (!window.adsbygoogle) {
      console.warn('Google AdSense not loaded. Make sure to add your client ID in index.html');
      return;
    }

    try {
      // Push the ad to AdSense
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error loading Google Ad:', error);
    }
  }, []);

  // Don't render if ads disabled or no ad slot provided
  if (!adsEnabled || !adSlot || adSlot === 'YOUR_AD_SLOT_ID') {
    return (
      <div 
        style={{
          ...style,
          background: 'rgba(255,255,255,0.05)',
          border: '2px dashed rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          borderRadius: '8px'
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'monospace' }}>
          Ad Placeholder - Add your ad slot ID
        </span>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={style}
      data-ad-client={clientId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
}
