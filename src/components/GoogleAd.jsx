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
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-3242929685798236';

  useEffect(() => {
    if (!adsEnabled || !adSlot || pushed.current) return;
    
    const tryPush = () => {
      if (!window.adsbygoogle || !adRef.current) return false;
      // Only push if the ad container has dimensions
      if (adRef.current.offsetHeight === 0 && adRef.current.offsetWidth === 0) return false;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch (error) {
        // AdSense may throw if ad slot is already filled or blocked
        console.error('AdSense push error:', error);
      }
      return true;
    };

    // Try immediately, then retry every 500ms up to 10s
    if (!tryPush()) {
      const interval = setInterval(() => {
        if (tryPush()) clearInterval(interval);
      }, 500);
      const maxTimer = setTimeout(() => clearInterval(interval), 10000);
      return () => { clearInterval(interval); clearTimeout(maxTimer); };
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
      style={{ display: 'block', ...style }}
      data-ad-client={clientId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
}
