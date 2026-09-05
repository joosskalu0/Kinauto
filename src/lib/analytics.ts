import { AnalyticsEvent, AnalyticsReport, Vehicle, Lead } from '../types';
import {
  initGoogleTagManager,
  pushToDataLayer,
  getStoredGtmDataLayer,
  clearGtmDataLayerHistory,
  generateGtmReport,
  generateGtmContainerExportJson,
  trackPageView as gtmTrackPageView,
  trackVehicleView as gtmTrackVehicleView,
  trackTestDriveRequest as gtmTrackTestDriveRequest,
  trackLeadSubmitted as gtmTrackLeadSubmitted,
  trackPriceOffer as gtmTrackPriceOffer,
  trackTradeInRequest as gtmTrackTradeInRequest,
  trackSocialShare as gtmTrackSocialShare,
  trackVehicleSearch as gtmTrackVehicleSearch,
  trackToggleFavorite as gtmTrackToggleFavorite,
  trackCompareVehicles as gtmTrackCompareVehicles
} from './gtm';

// Re-export GTM primitives
export {
  initGoogleTagManager,
  pushToDataLayer,
  getStoredGtmDataLayer,
  clearGtmDataLayerHistory,
  generateGtmReport,
  generateGtmContainerExportJson
};

// Backwards compatibility alias for GA init -> routes to GTM
export function initGoogleAnalytics(containerOrMeasurementId: string, isAdmin = false) {
  if (!containerOrMeasurementId || typeof window === 'undefined') return;
  initGoogleTagManager(containerOrMeasurementId, isAdmin);
}

// Backwards compatibility custom event tracker -> routes to dataLayer
export function trackCustomEvent(
  eventName: string,
  category: AnalyticsEvent['category'] = 'engagement',
  params: {
    dealershipId?: string;
    dealershipName?: string;
    vehicleId?: string;
    vehicleName?: string;
    pagePath?: string;
    details?: Record<string, any>;
  } = {}
): AnalyticsEvent {
  const gtmEv = pushToDataLayer({
    event: eventName,
    dealership_id: params.dealershipId,
    dealership_name: params.dealershipName,
    vehicle_id: params.vehicleId,
    vehicle_name: params.vehicleName,
    page_path: params.pagePath,
    ...(params.details || {})
  }, category);

  return {
    id: gtmEv.id,
    timestamp: gtmEv.timestamp,
    eventName: gtmEv.event,
    category,
    pagePath: gtmEv.page_path || '/',
    dealershipId: gtmEv.dealership_id,
    dealershipName: gtmEv.dealership_name,
    vehicleId: gtmEv.vehicle_id,
    vehicleName: gtmEv.vehicle_name,
    details: gtmEv.rawPayload
  };
}

export function getStoredAnalyticsEvents(): AnalyticsEvent[] {
  const gtmEvents = getStoredGtmDataLayer();
  return gtmEvents.map(ge => ({
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
}

export function generateAnalyticsReport(dealershipNameFilter?: string): AnalyticsReport {
  return generateGtmReport(dealershipNameFilter);
}

export const trackPageView = gtmTrackPageView;
export const trackVehicleView = gtmTrackVehicleView;
export const trackTestDriveRequest = gtmTrackTestDriveRequest;
export const trackLeadSubmitted = gtmTrackLeadSubmitted;
export const trackPriceOffer = gtmTrackPriceOffer;
export const trackTradeInRequest = gtmTrackTradeInRequest;
export const trackSocialShare = gtmTrackSocialShare;
export const trackVehicleSearch = gtmTrackVehicleSearch;
export const trackToggleFavorite = gtmTrackToggleFavorite;
export const trackCompareVehicles = gtmTrackCompareVehicles;
