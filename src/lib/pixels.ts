import { Vehicle, Lead } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: any;
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

// Active configured pixel tracking state
let activeMetaPixelId: string | null = null;
let activeTikTokPixelId: string | null = null;
let activeGoogleAdsId: string | null = null;
let activeGoogleAdsLabel: string | null = null;

/**
 * Initialize Meta Pixel (Facebook & Instagram Ads)
 */
export function initMetaPixel(pixelId: string) {
  if (!pixelId || typeof window === 'undefined') return;
  const cleanId = pixelId.trim();
  activeMetaPixelId = cleanId;

  // Check if script already injected
  if (!document.getElementById(`meta-pixel-script-${cleanId}`)) {
    const script = document.createElement('script');
    script.id = `meta-pixel-script-${cleanId}`;
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${cleanId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Noscript fallback
    if (!document.getElementById(`meta-pixel-noscript-${cleanId}`)) {
      const noscript = document.createElement('noscript');
      noscript.id = `meta-pixel-noscript-${cleanId}`;
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1" />`;
      document.body.appendChild(noscript);
    }
  } else if (typeof window.fbq === 'function') {
    window.fbq('init', cleanId);
    window.fbq('track', 'PageView');
  }
}

/**
 * Initialize TikTok Pixel (TikTok Ads Manager)
 */
export function initTikTokPixel(pixelId: string) {
  if (!pixelId || typeof window === 'undefined') return;
  const cleanId = pixelId.trim();
  activeTikTokPixelId = cleanId;

  if (!document.getElementById(`tiktok-pixel-script-${cleanId}`)) {
    const script = document.createElement('script');
    script.id = `tiktok-pixel-script-${cleanId}`;
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
        var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
        ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load('${cleanId}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);
  } else if (window.ttq && typeof window.ttq.page === 'function') {
    window.ttq.page();
  }
}

/**
 * Initialize Google Ads Tag (AW-XXXXXXXXX)
 */
export function initGoogleAds(adsId: string, conversionLabel?: string) {
  if (!adsId || typeof window === 'undefined') return;
  const cleanId = adsId.trim().toUpperCase();
  activeGoogleAdsId = cleanId;
  activeGoogleAdsLabel = conversionLabel?.trim() || null;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }

  if (!document.getElementById(`google-ads-script-${cleanId}`)) {
    const script = document.createElement('script');
    script.id = `google-ads-script-${cleanId}`;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${cleanId}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
    window.gtag('config', cleanId);
  } else {
    window.gtag('config', cleanId);
  }
}

// ----------------------------------------------------------------------
// Multi-Pixel Event Dispatcher
// ----------------------------------------------------------------------

export interface PixelEventPayload {
  eventName: 'PageView' | 'ViewContent' | 'Lead' | 'Schedule' | 'Contact' | 'Share' | 'SubmitPriceOffer';
  vehicleId?: string;
  vehicleName?: string;
  vehicleBrand?: string;
  vehiclePrice?: number;
  dealershipName?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  shareMethod?: string;
  value?: number;
  currency?: string;
  customData?: Record<string, any>;
}

export function trackPixelEvent(payload: PixelEventPayload) {
  if (typeof window === 'undefined') return;
  const currency = payload.currency || 'EUR';
  const val = payload.value || payload.vehiclePrice || 0;

  // 1. Dispatch to Meta Pixel (fbq)
  if (typeof window.fbq === 'function') {
    try {
      if (payload.eventName === 'PageView') {
        window.fbq('track', 'PageView');
      } else if (payload.eventName === 'ViewContent') {
        window.fbq('track', 'ViewContent', {
          content_type: 'product',
          content_ids: payload.vehicleId ? [payload.vehicleId] : undefined,
          content_name: payload.vehicleName,
          content_category: 'Automotive / Véhicule',
          value: val,
          currency: currency,
          brand: payload.vehicleBrand,
          dealership: payload.dealershipName
        });
      } else if (payload.eventName === 'Lead' || payload.eventName === 'SubmitPriceOffer') {
        window.fbq('track', 'Lead', {
          content_name: payload.vehicleName || 'Demande Concession',
          content_category: 'Lead Automobile',
          value: val > 0 ? val : 250,
          currency: currency,
          dealership: payload.dealershipName
        });
      } else if (payload.eventName === 'Schedule') {
        window.fbq('track', 'Schedule', {
          content_name: `Essai Routier - ${payload.vehicleName || ''}`,
          value: 500,
          currency: currency,
          dealership: payload.dealershipName
        });
      } else if (payload.eventName === 'Contact') {
        window.fbq('track', 'Contact', {
          content_name: payload.vehicleName,
          dealership: payload.dealershipName
        });
      } else if (payload.eventName === 'Share') {
        window.fbq('trackCustom', 'VehicleShare', {
          method: payload.shareMethod,
          vehicle_name: payload.vehicleName,
          dealership: payload.dealershipName
        });
      }
    } catch (e) {
      console.warn('[Meta Pixel] Error tracking event:', e);
    }
  }

  // 2. Dispatch to TikTok Pixel (ttq)
  if (window.ttq && typeof window.ttq.track === 'function') {
    try {
      if (payload.eventName === 'PageView') {
        window.ttq.page();
      } else if (payload.eventName === 'ViewContent') {
        window.ttq.track('ViewContent', {
          content_id: payload.vehicleId,
          content_type: 'product',
          content_name: payload.vehicleName,
          value: val,
          currency: currency,
          description: payload.vehicleBrand
        });
      } else if (payload.eventName === 'Lead' || payload.eventName === 'Schedule' || payload.eventName === 'SubmitPriceOffer') {
        window.ttq.track('SubmitForm', {
          content_name: payload.vehicleName,
          value: val > 0 ? val : (payload.eventName === 'Schedule' ? 500 : 250),
          currency: currency
        });
      } else if (payload.eventName === 'Contact') {
        window.ttq.track('Contact', {
          content_name: payload.vehicleName
        });
      }
    } catch (e) {
      console.warn('[TikTok Pixel] Error tracking event:', e);
    }
  }

  // 3. Dispatch to Google Ads Conversion
  if (typeof window.gtag === 'function' && activeGoogleAdsId) {
    try {
      const sendTo = activeGoogleAdsLabel ? `${activeGoogleAdsId}/${activeGoogleAdsLabel}` : activeGoogleAdsId;
      if (payload.eventName === 'Schedule' || payload.eventName === 'Lead' || payload.eventName === 'SubmitPriceOffer') {
        window.gtag('event', 'conversion', {
          send_to: sendTo,
          value: val > 0 ? val : (payload.eventName === 'Schedule' ? 500 : 250),
          currency: currency,
          transaction_id: `conv-${Date.now()}`
        });
      }
    } catch (e) {
      console.warn('[Google Ads] Error tracking conversion:', e);
    }
  }
}

/**
 * Helper to generate installation code snippets
 */
export function getPixelSnippets(config: {
  metaPixelId?: string;
  tikTokPixelId?: string;
  googleAdsId?: string;
  googleAdsLabel?: string;
}) {
  const metaId = config.metaPixelId || '123456789012345';
  const ttId = config.tikTokPixelId || 'C9XXXXXXXXXXXXXXX';
  const adsId = config.googleAdsId || 'AW-123456789';
  const adsLabel = config.googleAdsLabel || 'AbC_xYz12345';

  return {
    metaSnippet: `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${metaId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`,

    tikTokSnippet: `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
  var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
  ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${ttId}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`,

    googleAdsSnippet: `<!-- Google Ads Tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${adsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${adsId}');
</script>
<!-- Event snippet for Conversion -->
<script>
  gtag('event', 'conversion', {'send_to': '${adsId}/${adsLabel}', 'value': 500.0, 'currency': 'EUR'});
</script>`
  };
}
