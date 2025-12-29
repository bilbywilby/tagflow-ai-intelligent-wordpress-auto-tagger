import { Geofence, HubLocation } from './types';
import { polygonToH3Indexes } from './geofences-h3';
export function ingestGeoJSON(featureCollection: any): Geofence[] {
  if (featureCollection.type !== 'FeatureCollection') {
    throw new Error('Invalid GeoJSON: Expected FeatureCollection');
  }
  return featureCollection.features.map((feature: any) => {
    const props = feature.properties || {};
    const coords = feature.geometry.coordinates;
    // Simple BBox calculation
    let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;
    coords[0].forEach(([lng, lat]: [number, number]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });
    const h3Indexes = polygonToH3Indexes(coords, 9);
    return {
      id: props.id || crypto.randomUUID(),
      name: props.name || 'Unnamed District',
      canonicalPlace: (props.city || 'Greater LV') as HubLocation,
      aliases: props.aliases || [],
      zipCodes: props.zipCodes || [],
      h3Indexes,
      centroid: {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
      },
      bbox: [minLng, minLat, maxLng, maxLat]
    };
  });
}
export const INITIAL_VALLEY_BOUNDARIES = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Center City', city: 'Allentown', zipCodes: ['18101'] },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-75.48, 40.60], [-75.46, 40.60], [-75.46, 40.61], [-75.48, 40.61], [-75.48, 40.60]]]
      }
    }
  ]
};