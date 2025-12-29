import { Landmark, Geofence, H3Index } from './types';
import * as h3 from 'h3-js';
export const PRESET_LANDMARKS: Partial<Landmark>[] = [
  // Allentown
  { id: 'ppl-center', name: 'PPL Center', category: 'Entertainment', address: '701 Hamilton St, Allentown, PA 18101', lat: 40.6023, lng: -75.4714 },
  { id: 'coca-cola-park', name: 'Coca-Cola Park', category: 'Sports', address: '1050 IronPigs Way, Allentown, PA 18109', lat: 40.6258, lng: -75.4542 },
  { id: 'allentown-art-museum', name: 'Allentown Art Museum', category: 'Culture', address: '31 N 5th St, Allentown, PA 18101', lat: 40.6033, lng: -75.4703 },
  { id: 'miller-symphony-hall', name: 'Miller Symphony Hall', category: 'Arts', address: '23 N 6th St, Allentown, PA 18101', lat: 40.6030, lng: -75.4716 },
  { id: 'muhlenberg-college', name: 'Muhlenberg College', category: 'Education', address: '2400 Chew St, Allentown, PA 18104', lat: 40.5976, lng: -75.5097 },
  { id: 'allentown-fairgrounds', name: 'Allentown Fairgrounds', category: 'Entertainment', address: '302 N 17th St, Allentown, PA 18104', lat: 40.6019, lng: -75.4925 },
  { id: 'cedar-crest-college', name: 'Cedar Crest College', category: 'Education', address: '100 College Dr, Allentown, PA 18104', lat: 40.5878, lng: -75.5186 },
  { id: 'allentown-city-hall', name: 'Allentown City Hall', category: 'Government', address: '435 Hamilton St, Allentown, PA 18101', lat: 40.6025, lng: -75.4682 },
  { id: 'da-vinci-science', name: 'Da Vinci Science Center', category: 'Education', address: '3145 Hamilton Blvd, Allentown, PA 18103', lat: 40.5794, lng: -75.5268 },
  { id: 'lehigh-valley-zoo', name: 'Lehigh Valley Zoo', category: 'Public', address: '5150 Game Preserve Rd, Schnecksville, PA 18078', lat: 40.6552, lng: -75.6178 },
  // Bethlehem
  { id: 'steelstacks', name: 'SteelStacks', category: 'Entertainment', address: '101 Founders Way, Bethlehem, PA 18015', lat: 40.6152, lng: -75.3621 },
  { id: 'wind-creek', name: 'Wind Creek Event Center', category: 'Entertainment', address: '77 Wind Creek Blvd, Bethlehem, PA 18015', lat: 40.6145, lng: -75.3678 },
  { id: 'lehigh-university', name: 'Lehigh University', category: 'Education', address: '27 Memorial Dr W, Bethlehem, PA 18015', lat: 40.6083, lng: -75.3742 },
  { id: 'moravian-university', name: 'Moravian University', category: 'Education', address: '1200 Main St, Bethlehem, PA 18018', lat: 40.6300, lng: -75.3812 },
  { id: 'bethlehem-public-library', name: 'Bethlehem Public Library', category: 'Public', address: '11 W Church St, Bethlehem, PA 18018', lat: 40.6219, lng: -75.3783 },
  { id: 'artsquest-center', name: 'ArtsQuest Center', category: 'Arts', address: '101 Founders Way, Bethlehem, PA 18015', lat: 40.6155, lng: -75.3615 },
  { id: 'bethlehem-city-hall', name: 'Bethlehem City Hall', category: 'Government', address: '10 E Church St, Bethlehem, PA 18018', lat: 40.6225, lng: -75.3775 },
  { id: 'historic-hotel-bethlehem', name: 'Hotel Bethlehem', category: 'Culture', address: '437 Main St, Bethlehem, PA 18018', lat: 40.6205, lng: -75.3815 },
  { id: 'st-lukes-hospital', name: 'St. Lukes Hospital', category: 'Public', address: '801 Ostrum St, Bethlehem, PA 18015', lat: 40.6062, lng: -75.3725 },
  { id: 'west-gate-mall', name: 'Westgate Mall', category: 'Retail', address: '2285 Schoenersville Rd, Bethlehem, PA 18017', lat: 40.6485, lng: -75.3952 },
  // Easton
  { id: 'state-theatre', name: 'State Theatre', category: 'Arts', address: '453 Northampton St, Easton, PA 18042', lat: 40.6914, lng: -75.2114 },
  { id: 'lafayette-college', name: 'Lafayette College', category: 'Education', address: 'Easton, PA 18042', lat: 40.6978, lng: -75.2104 },
  { id: 'easton-public-market', name: 'Easton Public Market', category: 'Retail', address: '325 Northampton St, Easton, PA 18042', lat: 40.6912, lng: -75.2102 },
  { id: 'crayola-experience', name: 'Crayola Experience', category: 'Entertainment', address: '30 Centre Square, Easton, PA 18042', lat: 40.6908, lng: -75.2095 },
  { id: 'sigal-museum', name: 'Sigal Museum', category: 'Culture', address: '342 Northampton St, Easton, PA 18042', lat: 40.6910, lng: -75.2105 },
  { id: 'easton-city-hall', name: 'Easton City Hall', category: 'Government', address: '123 S 3rd St, Easton, PA 18042', lat: 40.6895, lng: -75.2110 },
  { id: 'riverside-park', name: 'Riverside Park Easton', category: 'Public', address: 'Easton, PA 18042', lat: 40.6922, lng: -75.2055 },
  // Greater LV & Utilities
  { id: 'lv-airport', name: 'Lehigh Valley Airport', category: 'Public', address: '3311 Airport Rd, Allentown, PA 18109', lat: 40.6521, lng: -75.4405 },
  { id: 'dorney-park', name: 'Dorney Park', category: 'Entertainment', address: '3830 Dorney Park Rd, Allentown, PA 18104', lat: 40.5815, lng: -75.5348 },
  { id: 'lv-health-network', name: 'LVHN Cedar Crest', category: 'Public', address: '1200 S Cedar Crest Blvd, Allentown, PA 18103', lat: 40.5695, lng: -75.5135 },
  { id: 'promenade-saucon', name: 'Promenade Saucon Valley', category: 'Retail', address: 'Center Valley, PA 18034', lat: 40.5405, lng: -75.4182 }
];
export function resolveVenueToCoords(venueName: string, landmarks: Landmark[]): [number, number] | null {
  const landmark = resolveVenueToLandmark(venueName, landmarks);
  return landmark ? [landmark.lat, landmark.lng] : null;
}
export function resolveVenueToLandmark(venueName: string, landmarks: Landmark[]): Landmark | null {
  const lowerVenue = venueName.toLowerCase();
  // 1. Exact or Substring match
  for (const landmark of landmarks) {
    const lName = landmark.name.toLowerCase();
    if (lowerVenue.includes(lName) || lName.includes(lowerVenue)) {
      return landmark;
    }
  }
  // 2. Token overlap fallback
  const venueTokens = lowerVenue.split(/\s+/).filter(t => t.length > 3);
  for (const landmark of landmarks) {
    const lTokens = landmark.name.toLowerCase().split(/\s+/);
    const overlap = venueTokens.filter(t => lTokens.includes(t));
    if (overlap.length >= 2) return landmark;
  }
  return null;
}
export function landmarkToNeighborhood(landmark: Landmark, geofences: Geofence[]): Geofence | null {
  if (landmark.associatedGeofenceId) {
    return geofences.find(f => f.id === landmark.associatedGeofenceId) || null;
  }
  for (const fence of geofences) {
    if (fence.h3Indexes?.includes(landmark.h3Index)) {
      return fence;
    }
  }
  return null;
}