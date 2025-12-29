import { Landmark, Geofence, H3Index } from './types';
import * as h3 from 'h3-js';
export const PRESET_LANDMARKS: Partial<Landmark>[] = [
  { id: 'ppl-center', name: 'PPL Center', category: 'Entertainment', address: '701 Hamilton St, Allentown, PA 18101', lat: 40.6023, lng: -75.4714 },
  { id: 'steelstacks', name: 'SteelStacks', category: 'Entertainment', address: '101 Founders Way, Bethlehem, PA 18015', lat: 40.6152, lng: -75.3621 },
  { id: 'state-theatre', name: 'State Theatre', category: 'Arts', address: '453 Northampton St, Easton, PA 18042', lat: 40.6914, lng: -75.2114 },
  { id: 'coca-cola-park', name: 'Coca-Cola Park', category: 'Sports', address: '1050 IronPigs Way, Allentown, PA 18109', lat: 40.6258, lng: -75.4542 },
  { id: 'wind-creek', name: 'Wind Creek Event Center', category: 'Entertainment', address: '77 Wind Creek Blvd, Bethlehem, PA 18015', lat: 40.6145, lng: -75.3678 },
  { id: 'muhlenberg-college', name: 'Muhlenberg College', category: 'Education', address: '2400 Chew St, Allentown, PA 18104', lat: 40.5976, lng: -75.5097 },
  { id: 'lehigh-university', name: 'Lehigh University', category: 'Education', address: '27 Memorial Dr W, Bethlehem, PA 18015', lat: 40.6083, lng: -75.3742 },
  { id: 'lafayette-college', name: 'Lafayette College', category: 'Education', address: 'Easton, PA 18042', lat: 40.6978, lng: -75.2104 },
  { id: 'allentown-art-museum', name: 'Allentown Art Museum', category: 'Culture', address: '31 N 5th St, Allentown, PA 18101', lat: 40.6033, lng: -75.4703 },
  { id: 'miller-symphony-hall', name: 'Miller Symphony Hall', category: 'Arts', address: '23 N 6th St, Allentown, PA 18101', lat: 40.6030, lng: -75.4716 }
];
export function resolveVenueToLandmark(venueName: string, landmarks: Landmark[]): Landmark | null {
  const lowerVenue = venueName.toLowerCase();
  // Try exact or contains match
  for (const landmark of landmarks) {
    if (lowerVenue.includes(landmark.name.toLowerCase()) || landmark.name.toLowerCase().includes(lowerVenue)) {
      return landmark;
    }
  }
  return null;
}
export function landmarkToNeighborhood(landmark: Landmark, geofences: Geofence[]): Geofence | null {
  if (landmark.associatedGeofenceId) {
    return geofences.find(f => f.id === landmark.associatedGeofenceId) || null;
  }
  // Fallback to spatial check
  for (const fence of geofences) {
    if (fence.h3Indexes?.includes(landmark.h3Index)) {
      return fence;
    }
  }
  return null;
}