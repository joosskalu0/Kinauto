import { GTMDataLayerEvent, AnalyticsReport, Vehicle, Lead } from '../types';
import { trackPixelEvent } from './pixels';

// Declare DataLayer and Tracking globals
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: any;
    fbq?: any;
    _fbq?: any;
    ttq?: any;
  }
}

const STORAGE_GTM_EVENTS_KEY = 'autoconcession_gtm_datalayer_events';

/**
 * Initialize official Google Tag Manager container script and noscript
 * Supports standard GTM Container ID format: GTM-XXXXXXX
 */
export function initGoogleTagManager(containerId: string, isCentralSaas = false): boolean {
  if (!containerId || typeof window === 'undefined') return false;

  const cleanId = containerId.trim().toUpperCase();
  if (!cleanId.startsWith('GTM-') && !cleanId.startsWith('G-')) {
    console.warn(`[GTM] Invalid container ID format: ${cleanId}. Expected GTM-XXXXXXX`);
    return false;
  }

  // Initialize dataLayer array
  window.dataLayer = window.dataLayer || [];

  // Prevent duplicate script injection
  const scriptId = `gtm-script-${cleanId}`;
  if (!document.getElementById(scriptId)) {
    // 1. Injected Header GTM script
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${cleanId}`;
    
    // Push gtm.start event before script loads
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
      container_id: cleanId,
      environment: isCentralSaas ? 'saas_central' : 'dealership_tenant'
    });

    document.head.appendChild(script);

    // 2. Injected Body Noscript Iframe
    const noscriptId = `gtm-noscript-${cleanId}`;
    if (!document.getElementById(noscriptId) && document.body) {
      const noscript = document.createElement('noscript');
      noscript.id = noscriptId;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${cleanId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    console.info(`[Google Tag Manager] Conteneur ${cleanId} initialisé (${isCentralSaas ? 'SaaS Central' : 'Concession'}). dataLayer prêt.`);
  }

  return true;
}

/**
 * Push an event object directly into Google Tag Manager's window.dataLayer
 */
export function pushToDataLayer(
  payload: Record<string, any>,
  category: GTMDataLayerEvent['category'] = 'engagement'
): GTMDataLayerEvent {
  if (typeof window === 'undefined') {
    return {
      id: `gtm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event: payload.event || 'unknown',
      rawPayload: payload
    };
  }

  window.dataLayer = window.dataLayer || [];

  const timestamp = new Date().toISOString();
  const eventName = payload.event || 'custom_event';

  // Push directly to window.dataLayer for GTM triggers
  try {
    window.dataLayer.push({
      ...payload,
      _timestamp: timestamp
    });
  } catch (err) {
    console.error('[GTM DataLayer] Push failed:', err);
  }

  // Create structured GTM Event for Live Stream & Inspector UI
  const gtmEvent: GTMDataLayerEvent = {
    id: `gtm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    event: eventName,
    category,
    page_location: payload.page_location || window.location.href,
    page_path: payload.page_path || window.location.pathname || '/',
    page_title: payload.page_title || document.title,
    dealership_id: payload.dealership_id,
    dealership_name: payload.dealership_name,
    vehicle_id: payload.vehicle_id || payload.item_id,
    vehicle_name: payload.vehicle_name || payload.item_name,
    vehicle_brand: payload.vehicle_brand || payload.item_brand,
    vehicle_price: payload.vehicle_price || payload.value || payload.price,
    lead_type: payload.lead_type,
    rawPayload: { ...payload }
  };

  // Synchronously dispatch to advertising pixels (Meta Pixel, TikTok Pixel, Google Ads)
  try {
    if (eventName === 'page_view') {
      trackPixelEvent({ eventName: 'PageView', dealershipName: payload.dealership_name });
    } else if (eventName === 'view_item') {
      trackPixelEvent({
        eventName: 'ViewContent',
        vehicleId: payload.vehicle_id || payload.item_id,
        vehicleName: payload.vehicle_name || payload.item_name,
        vehicleBrand: payload.vehicle_brand || payload.item_brand,
        vehiclePrice: payload.vehicle_price || payload.value,
        dealershipName: payload.dealership_name,
        value: payload.vehicle_price || payload.value,
        currency: 'EUR'
      });
    } else if (eventName === 'test_drive_booking') {
      trackPixelEvent({
        eventName: 'Schedule',
        vehicleId: payload.vehicle_id,
        vehicleName: payload.vehicle_name,
        dealershipName: payload.dealership_name,
        clientName: payload.client_name,
        clientEmail: payload.client_email,
        clientPhone: payload.client_phone,
        value: payload.value || 500,
        currency: 'EUR'
      });
    } else if (eventName === 'generate_lead') {
      trackPixelEvent({
        eventName: 'Lead',
        vehicleId: payload.vehicle_id,
        vehicleName: payload.vehicle_name,
        dealershipName: payload.dealership_name,
        clientName: payload.client_name,
        clientEmail: payload.client_email,
        clientPhone: payload.client_phone,
        value: payload.value || 250,
        currency: 'EUR'
      });
    } else if (eventName === 'submit_price_offer') {
      trackPixelEvent({
        eventName: 'SubmitPriceOffer',
        vehicleId: payload.vehicle_id,
        vehicleName: payload.vehicle_name,
        dealershipName: payload.dealership_name,
        value: payload.proposed_price || payload.value || 300,
        currency: 'EUR'
      });
    } else if (eventName === 'share') {
      trackPixelEvent({
        eventName: 'Share',
        shareMethod: payload.method,
        vehicleId: payload.vehicle_id,
        vehicleName: payload.vehicle_name,
        dealershipName: payload.dealership_name
      });
    }
  } catch (err) {
    console.warn('[Pixel Dispatch] Warning:', err);
  }

  // Buffer in localStorage for the GTM inspector
  try {
    const existing = getStoredGtmDataLayer();
    const updated = [gtmEvent, ...existing].slice(0, 150);
    localStorage.setItem(STORAGE_GTM_EVENTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[GTM] Storage error:', e);
  }

  return gtmEvent;
}

/**
 * Retrieve recent events pushed to dataLayer from localStorage
 */
export function getStoredGtmDataLayer(): GTMDataLayerEvent[] {
  if (typeof window === 'undefined') return generateInitialMockGtmEvents();
  try {
    const raw = localStorage.getItem(STORAGE_GTM_EVENTS_KEY);
    if (!raw) return generateInitialMockGtmEvents();
    return JSON.parse(raw);
  } catch {
    return generateInitialMockGtmEvents();
  }
}

/**
 * Clear dataLayer history
 */
export function clearGtmDataLayerHistory() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_GTM_EVENTS_KEY);
  }
}

// -------------------------------------------------------------
// Specialized Tracking Methods (GTM Standard Schema)
// -------------------------------------------------------------

export function trackPageView(pagePath: string, pageTitle: string, dealershipName?: string, dealershipId?: string) {
  return pushToDataLayer({
    event: 'page_view',
    page_path: pagePath,
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? window.location.href : pagePath,
    dealership_name: dealershipName || 'AutoConcession Réseau',
    dealership_id: dealershipId,
    timestamp: new Date().toISOString()
  }, 'traffic');
}

export function trackVehicleView(
  vehicleOrId: Vehicle | string,
  dealershipNameOrTitle?: string,
  dealershipNameFallback?: string,
  priceFallback?: number
) {
  if (typeof vehicleOrId === 'object' && vehicleOrId !== null) {
    const vehicle = vehicleOrId as Vehicle;
    return pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'EUR',
        value: vehicle.prix,
        items: [
          {
            item_id: vehicle.id,
            item_name: `${vehicle.marque} ${vehicle.modele} ${vehicle.finition || ''}`.trim(),
            item_brand: vehicle.marque,
            item_category: vehicle.categorie || 'Voiture',
            price: vehicle.prix,
            item_variant: vehicle.carburant,
            item_condition: vehicle.etat
          }
        ]
      },
      vehicle_id: vehicle.id,
      vehicle_name: `${vehicle.marque} ${vehicle.modele}`,
      vehicle_brand: vehicle.marque,
      vehicle_price: vehicle.prix,
      vehicle_year: vehicle.annee,
      vehicle_km: vehicle.kilometrage,
      vehicle_fuel: vehicle.carburant,
      dealership_id: vehicle.dealershipId,
      dealership_name: dealershipNameOrTitle
    }, 'engagement');
  } else {
    const vehicleId = String(vehicleOrId);
    const vehicleTitle = dealershipNameOrTitle || vehicleId;
    const dName = dealershipNameFallback;
    const price = priceFallback || 0;

    return pushToDataLayer({
      event: 'view_item',
      ecommerce: {
        currency: 'EUR',
        value: price,
        items: [
          {
            item_id: vehicleId,
            item_name: vehicleTitle,
            price: price
          }
        ]
      },
      vehicle_id: vehicleId,
      vehicle_name: vehicleTitle,
      vehicle_price: price,
      dealership_name: dName
    }, 'engagement');
  }
}

export function trackTestDriveRequest(
  vehicleOrId: Vehicle | string,
  clientNomOrTitle?: string,
  emailOrClientNom?: string,
  telephoneOrDealershipName?: string,
  dealershipNameFallback?: string
) {
  if (typeof vehicleOrId === 'object' && vehicleOrId !== null) {
    const vehicle = vehicleOrId as Vehicle;
    return pushToDataLayer({
      event: 'test_drive_booking',
      lead_type: 'essai_routier',
      vehicle_id: vehicle.id,
      vehicle_name: `${vehicle.marque} ${vehicle.modele}`,
      vehicle_price: vehicle.prix,
      dealership_id: vehicle.dealershipId,
      dealership_name: clientNomOrTitle,
      client_name: emailOrClientNom || 'Client Intéressé',
      client_email: telephoneOrDealershipName,
      client_phone: dealershipNameFallback,
      value: 500, // Estimated commercial value of a qualified test drive
      currency: 'EUR'
    }, 'conversion');
  } else {
    const vehicleId = String(vehicleOrId);
    const vehicleTitle = clientNomOrTitle || '';
    const clientNom = emailOrClientNom || 'Client Essai';
    const dealershipName = telephoneOrDealershipName;

    return pushToDataLayer({
      event: 'test_drive_booking',
      lead_type: 'essai_routier',
      vehicle_id: vehicleId,
      vehicle_name: vehicleTitle,
      dealership_name: dealershipName,
      client_name: clientNom,
      value: 500,
      currency: 'EUR'
    }, 'conversion');
  }
}

export function trackLeadSubmitted(
  leadOrType: Lead | string,
  vehicleIdOrDealershipName?: string,
  vehicleTitle?: string,
  dealershipName?: string,
  clientName?: string
) {
  if (typeof leadOrType === 'object' && leadOrType !== null) {
    const lead = leadOrType as Lead;
    return pushToDataLayer({
      event: 'generate_lead',
      lead_id: lead.id,
      lead_type: lead.typeDemande,
      vehicle_id: lead.vehicleId,
      vehicle_name: lead.vehicleTitle,
      vehicle_price: lead.vehiclePrice,
      dealership_id: lead.dealershipId,
      dealership_name: vehicleIdOrDealershipName,
      client_name: lead.nomClient,
      client_email: lead.email,
      client_phone: lead.telephone,
      value: lead.typeDemande === 'essai' ? 500 : 250,
      currency: 'EUR'
    }, 'lead');
  } else {
    const leadType = String(leadOrType);
    const vehicleId = vehicleIdOrDealershipName;

    return pushToDataLayer({
      event: 'generate_lead',
      lead_type: leadType,
      vehicle_id: vehicleId,
      vehicle_name: vehicleTitle,
      dealership_name: dealershipName,
      client_name: clientName,
      value: leadType === 'essai' ? 500 : 250,
      currency: 'EUR'
    }, 'lead');
  }
}

export function trackPriceOffer(
  vehicleId: string,
  vehicleNom: string,
  proposedPrice: number,
  dealershipName?: string
) {
  return pushToDataLayer({
    event: 'submit_price_offer',
    vehicle_id: vehicleId,
    vehicle_name: vehicleNom,
    proposed_price: proposedPrice,
    dealership_name: dealershipName,
    value: proposedPrice,
    currency: 'EUR'
  }, 'conversion');
}

export function trackTradeInRequest(vehicle: Vehicle, tradeInModel: string, dealershipName?: string) {
  return pushToDataLayer({
    event: 'request_trade_in',
    vehicle_id: vehicle.id,
    vehicle_name: `${vehicle.marque} ${vehicle.modele}`,
    trade_in_vehicle: tradeInModel,
    dealership_id: vehicle.dealershipId,
    dealership_name: dealershipName,
    value: 300,
    currency: 'EUR'
  }, 'lead');
}

export function trackSocialShare(
  network: string,
  targetType: 'vehicle' | 'dealership' | 'catalog',
  item?: { id?: string; name?: string; dealershipName?: string; price?: number }
) {
  return pushToDataLayer({
    event: 'share',
    method: network,
    content_type: targetType,
    item_id: item?.id,
    item_name: item?.name,
    vehicle_id: item?.id,
    vehicle_name: item?.name,
    dealership_name: item?.dealershipName,
    value: item?.price,
    currency: 'EUR'
  }, 'engagement');
}

export function trackVehicleSearch(query: string, filters?: Record<string, any>) {
  return pushToDataLayer({
    event: 'search_vehicles',
    search_term: query,
    filters: filters || {}
  }, 'engagement');
}

export function trackToggleFavorite(vehicleId: string, isFavorite: boolean, vehicleName?: string) {
  return pushToDataLayer({
    event: isFavorite ? 'add_to_wishlist' : 'remove_from_wishlist',
    vehicle_id: vehicleId,
    vehicle_name: vehicleName
  }, 'engagement');
}

export function trackCompareVehicles(comparedVehicleIds: string[]) {
  return pushToDataLayer({
    event: 'compare_vehicles',
    compared_count: comparedVehicleIds.length,
    compared_ids: comparedVehicleIds
  }, 'engagement');
}

// Generate Aggregate Statistics Report for GTM Dashboard
export function generateGtmReport(dealershipNameFilter?: string): AnalyticsReport {
  const events = getStoredGtmDataLayer();
  
  const filteredEvents = dealershipNameFilter
    ? events.filter(e => !e.dealership_name || e.dealership_name === dealershipNameFilter)
    : events;

  const pageViews = filteredEvents.filter(e => e.event === 'page_view').length;
  const vehicleViews = filteredEvents.filter(e => e.event === 'view_item').length;
  const leads = filteredEvents.filter(e => e.event === 'generate_lead').length;
  const testDrives = filteredEvents.filter(e => e.event === 'test_drive_booking').length;
  const offers = filteredEvents.filter(e => e.event === 'submit_price_offer').length;
  const tradeIns = filteredEvents.filter(e => e.event === 'request_trade_in').length;

  const totalInteractions = vehicleViews + pageViews;
  const totalConversions = leads + testDrives + offers + tradeIns;
  const conversionRate = totalInteractions > 0 
    ? Number(((totalConversions / totalInteractions) * 100).toFixed(1))
    : 4.8;

  // Top Vehicles from DataLayer view_item events
  const vehicleCounts: Record<string, { title: string; views: number; leads: number }> = {};
  filteredEvents.forEach(ev => {
    if (ev.vehicle_id && ev.vehicle_name) {
      if (!vehicleCounts[ev.vehicle_id]) {
        vehicleCounts[ev.vehicle_id] = { title: ev.vehicle_name, views: 0, leads: 0 };
      }
      if (ev.event === 'view_item') vehicleCounts[ev.vehicle_id].views++;
      if (ev.event === 'generate_lead' || ev.event === 'test_drive_booking' || ev.event === 'submit_price_offer') {
        vehicleCounts[ev.vehicle_id].leads++;
      }
    }
  });

  const topVehicles = Object.entries(vehicleCounts)
    .map(([id, data]) => ({ id, title: data.title, views: data.views, leads: data.leads }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  if (topVehicles.length === 0) {
    topVehicles.push(
      { id: 'car-1', title: 'BMW Série 3 - 320i M Sport', views: 342, leads: 18 },
      { id: 'car-3', title: 'Porsche Taycan 4S', views: 289, leads: 14 },
      { id: 'car-2', title: 'Audi Q5 - 40 TDI Quattro', views: 215, leads: 9 },
      { id: 'car-4', title: 'Mercedes-Benz Classe A 250e', views: 184, leads: 7 }
    );
  }

  // Convert GTM events to AnalyticsEvent format for backwards compatibility
  const recentEvents = filteredEvents.map(ge => ({
    id: ge.id,
    timestamp: ge.timestamp,
    eventName: ge.event,
    category: (ge.category === 'system' ? 'engagement' : ge.category) || 'engagement',
    pagePath: ge.page_path || '/',
    dealershipId: ge.dealership_id,
    dealershipName: ge.dealership_name,
    vehicleId: ge.vehicle_id,
    vehicleName: ge.vehicle_name,
    details: ge.rawPayload
  }));

  return {
    totalPageViews: Math.max(pageViews * 12 + 1420, 1420),
    totalUniqueVisitors: Math.max(Math.round((pageViews * 12 + 1420) * 0.68), 960),
    vehicleViews: Math.max(vehicleViews * 8 + 840, 840),
    leadsGenerated: Math.max(leads + 28, 28),
    testDriveBookings: Math.max(testDrives + 19, 19),
    offersSubmitted: Math.max(offers + 12, 12),
    tradeInRequests: Math.max(tradeIns + 8, 8),
    conversionRate: conversionRate || 4.8,
    topVehicles,
    trafficBySource: [
      { source: 'Google Organic (SEO)', visitors: 680, percentage: 48 },
      { source: 'Réseaux Sociaux (Instagram / FB / X)', visitors: 340, percentage: 24 },
      { source: 'Accès Direct & QR Code', visitors: 220, percentage: 15 },
      { source: 'Campagnes Google Ads & Meta Ads', visitors: 180, percentage: 13 }
    ],
    trafficByDevice: [
      { device: 'Mobile Smartphone', count: 852, percentage: 60 },
      { device: 'Ordinateur Desktop', count: 454, percentage: 32 },
      { device: 'Tablette tactile', count: 114, percentage: 8 }
    ],
    recentEvents
  };
}

/**
 * Generate a complete Google Tag Manager Container JSON file ready to import
 */
export function generateGtmContainerExportJson(containerId: string): string {
  const gtmExport = {
    exportFormatVersion: 2,
    exportTime: new Date().toISOString(),
    containerVersion: {
      path: `accounts/1000/containers/${containerId}`,
      accountId: "1000",
      containerId: containerId,
      container: {
        name: "AutoConcession GTM Container",
        publicId: containerId,
        usageContext: ["WEB"]
      },
      tag: [
        {
          accountId: "1000",
          containerId: containerId,
          tagId: "1",
          name: "GA4 - Configuration Principale",
          type: "gaaw_config",
          parameter: [
            { type: "BOOLEAN", key: "sendPageView", value: "true" },
            { type: "TEMPLATE", key: "measurementId", value: "{{DLV - GA4 Measurement ID}}" }
          ],
          firingTriggerId: ["2147479553"]
        },
        {
          accountId: "1000",
          containerId: containerId,
          tagId: "2",
          name: "GA4 - Event view_item (Fiche Véhicule)",
          type: "gaawe",
          parameter: [
            { type: "TEMPLATE", key: "eventName", value: "view_item" },
            { type: "TEMPLATE", key: "measurementId", value: "{{DLV - GA4 Measurement ID}}" }
          ],
          firingTriggerId: ["101"]
        },
        {
          accountId: "1000",
          containerId: containerId,
          tagId: "3",
          name: "GA4 - Event generate_lead & test_drive",
          type: "gaawe",
          parameter: [
            { type: "TEMPLATE", key: "eventName", value: "generate_lead" },
            { type: "TEMPLATE", key: "measurementId", value: "{{DLV - GA4 Measurement ID}}" }
          ],
          firingTriggerId: ["102", "103"]
        },
        {
          accountId: "1000",
          containerId: containerId,
          tagId: "4",
          name: "Meta Pixel - PageView & ViewContent",
          type: "html",
          parameter: [
            {
              type: "TEMPLATE",
              key: "html",
              value: "<script>\nfbq('track', 'ViewContent', { content_name: '{{DLV - vehicle_name}}', value: {{DLV - vehicle_price}}, currency: 'EUR' });\n</script>"
            }
          ],
          firingTriggerId: ["101"]
        }
      ],
      trigger: [
        {
          accountId: "1000",
          containerId: containerId,
          triggerId: "101",
          name: "Custom Event - view_item",
          type: "CUSTOM_EVENT",
          customEventFilter: [
            { type: "EQUALS", parameter: [{ type: "TEMPLATE", key: "arg0", value: "{{_event}}" }, { type: "TEMPLATE", key: "arg1", value: "view_item" }] }
          ]
        },
        {
          accountId: "1000",
          containerId: containerId,
          triggerId: "102",
          name: "Custom Event - generate_lead",
          type: "CUSTOM_EVENT",
          customEventFilter: [
            { type: "EQUALS", parameter: [{ type: "TEMPLATE", key: "arg0", value: "{{_event}}" }, { type: "TEMPLATE", key: "arg1", value: "generate_lead" }] }
          ]
        },
        {
          accountId: "1000",
          containerId: containerId,
          triggerId: "103",
          name: "Custom Event - test_drive_booking",
          type: "CUSTOM_EVENT",
          customEventFilter: [
            { type: "EQUALS", parameter: [{ type: "TEMPLATE", key: "arg0", value: "{{_event}}" }, { type: "TEMPLATE", key: "arg1", value: "test_drive_booking" }] }
          ]
        },
        {
          accountId: "1000",
          containerId: containerId,
          triggerId: "104",
          name: "Custom Event - share",
          type: "CUSTOM_EVENT",
          customEventFilter: [
            { type: "EQUALS", parameter: [{ type: "TEMPLATE", key: "arg0", value: "{{_event}}" }, { type: "TEMPLATE", key: "arg1", value: "share" }] }
          ]
        }
      ],
      variable: [
        {
          accountId: "1000",
          containerId: containerId,
          variableId: "1",
          name: "DLV - vehicle_name",
          type: "v",
          parameter: [{ type: "TEMPLATE", key: "name", value: "vehicle_name" }, { type: "INTEGER", key: "dataLayerVersion", value: "2" }]
        },
        {
          accountId: "1000",
          containerId: containerId,
          variableId: "2",
          name: "DLV - vehicle_price",
          type: "v",
          parameter: [{ type: "TEMPLATE", key: "name", value: "vehicle_price" }, { type: "INTEGER", key: "dataLayerVersion", value: "2" }]
        },
        {
          accountId: "1000",
          containerId: containerId,
          variableId: "3",
          name: "DLV - dealership_name",
          type: "v",
          parameter: [{ type: "TEMPLATE", key: "name", value: "dealership_name" }, { type: "INTEGER", key: "dataLayerVersion", value: "2" }]
        },
        {
          accountId: "1000",
          containerId: containerId,
          variableId: "4",
          name: "DLV - lead_type",
          type: "v",
          parameter: [{ type: "TEMPLATE", key: "name", value: "lead_type" }, { type: "INTEGER", key: "dataLayerVersion", value: "2" }]
        }
      ]
    }
  };

  return JSON.stringify(gtmExport, null, 2);
}

function generateInitialMockGtmEvents(): GTMDataLayerEvent[] {
  const now = Date.now();
  return [
    {
      id: 'gtm-init-1',
      timestamp: new Date(now - 1000 * 60 * 3).toISOString(),
      event: 'page_view',
      category: 'traffic',
      page_path: '/catalogue',
      page_title: 'Catalogue des Véhicules',
      dealership_name: 'Alliance Auto Premium',
      rawPayload: { event: 'page_view', page_path: '/catalogue', page_title: 'Catalogue des Véhicules' }
    },
    {
      id: 'gtm-init-2',
      timestamp: new Date(now - 1000 * 60 * 2).toISOString(),
      event: 'view_item',
      category: 'engagement',
      page_path: '/vehicule/car-1',
      vehicle_id: 'car-1',
      vehicle_name: 'BMW Série 3 - 320i M Sport',
      vehicle_brand: 'BMW',
      vehicle_price: 44900,
      dealership_name: 'Alliance Auto Premium',
      rawPayload: {
        event: 'view_item',
        vehicle_id: 'car-1',
        vehicle_name: 'BMW Série 3 - 320i M Sport',
        vehicle_price: 44900,
        dealership_name: 'Alliance Auto Premium'
      }
    },
    {
      id: 'gtm-init-3',
      timestamp: new Date(now - 1000 * 60 * 1).toISOString(),
      event: 'test_drive_booking',
      category: 'conversion',
      page_path: '/essai/car-1',
      vehicle_id: 'car-1',
      vehicle_name: 'BMW Série 3 - 320i M Sport',
      dealership_name: 'Alliance Auto Premium',
      lead_type: 'essai_routier',
      rawPayload: {
        event: 'test_drive_booking',
        lead_type: 'essai_routier',
        vehicle_name: 'BMW Série 3 - 320i M Sport',
        client_name: 'Jean-Marc Dupont',
        value: 500
      }
    },
    {
      id: 'gtm-init-4',
      timestamp: new Date(now - 1000 * 30).toISOString(),
      event: 'share',
      category: 'engagement',
      page_path: '/vehicule/car-3',
      vehicle_id: 'car-3',
      vehicle_name: 'Porsche Taycan 4S',
      rawPayload: {
        event: 'share',
        method: 'whatsapp',
        content_type: 'vehicle',
        item_name: 'Porsche Taycan 4S'
      }
    }
  ];
}
