import { useEffect, useRef } from 'react';

/**
 * Google AdSense Ad Component
 */
export default function GoogleAd({ 
  adSlot, 
  style = {}, 
  adFormat = 'auto',
  fullWidthResponsive = true 
}) {
  const adRef = useRef(null);
  const pushed = useRef(false);
  const adsEnabled = import.meta.env.VITE_ADS_ENABLED !== 'false';
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT;

  useEffect(() => {
    if (!adsEnabled || !adSlot || pushed.current) return;
    
    // Wait for adsbygoogle script to load
    const tryPush = () => {
      if (!window.adsbygoogle) return false;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (error) {
        // AdSense may throw if ad slot is already filled or blocked
        console.error('AdSense push error:', error);
      }
      return true;
    };

    // Try immediately, retry after short delay if script not loaded yet
    if (!tryPush()) {
      const timer = setTimeout(tryPush, 1500);
      return () => clearTimeout(timer);
    }
  }, [adsEnabled, adSlot]);

  // Don't render if ads disabled or no ad slot provided
  if (!adsEnabled || !adSlot) {
    return null;
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
