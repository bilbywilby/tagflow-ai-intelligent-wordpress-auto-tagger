import { Geofence, HubLocation } from './types';
export const REGIONAL_GEOFENCES: Geofence[] = [
  // Allentown
  { id: 'at-cc', name: 'Center City', canonicalPlace: 'Allentown', aliases: ['Downtown Allentown', 'Hamilton District', '7th Street'], zipCodes: ['18101', '18102'] },
  { id: 'at-we', name: 'West End', canonicalPlace: 'Allentown', aliases: ['West End Theatre District', '19th Street', 'Muhlenberg area'], zipCodes: ['18104'] },
  { id: 'at-ss', name: 'South Side', canonicalPlace: 'Allentown', aliases: ['South Allentown', 'Lehigh Street corridor'], zipCodes: ['18103'] },
  { id: 'at-es', name: 'East Side', canonicalPlace: 'Allentown', aliases: ['East Allentown', 'Hanover Ave'], zipCodes: ['18109'] },
  // Bethlehem
  { id: 'bt-ns', name: 'North Side', canonicalPlace: 'Bethlehem', aliases: ['Historic District', 'Main Street Bethlehem', 'Moravian'], zipCodes: ['18018'] },
  { id: 'bt-ss', name: 'South Side', canonicalPlace: 'Bethlehem', aliases: ['SteelStacks', 'Lehigh University', '3rd Street', '4th Street'], zipCodes: ['18015'] },
  { id: 'bt-ws', name: 'West Side', canonicalPlace: 'Bethlehem', aliases: ['West Bethlehem'], zipCodes: ['18017'] },
  // Easton
  { id: 'et-dt', name: 'Downtown', canonicalPlace: 'Easton', aliases: ['Centre Square', 'Easton Circle', 'Riverside'], zipCodes: ['18042'] },
  { id: 'et-ch', name: 'College Hill', canonicalPlace: 'Easton', aliases: ['Lafayette College area'], zipCodes: ['18042'] },
  { id: 'et-ww', name: 'West Ward', canonicalPlace: 'Easton', aliases: ['Easton West Ward'], zipCodes: ['18042'] }
];
export function resolveNeighborhood(text: string): Geofence | null {
  const lowerText = text.toLowerCase();
  for (const fence of REGIONAL_GEOFENCES) {
    if (lowerText.includes(fence.name.toLowerCase())) return fence;
    for (const alias of fence.aliases) {
      if (lowerText.includes(alias.toLowerCase())) return fence;
    }
  }
  return null;
}
export function getGeofencesForCity(city: HubLocation): Geofence[] {
  return REGIONAL_GEOFENCES.filter(f => f.canonicalPlace === city);
}
export function extractZipCode(text: string): string | undefined {
  const match = text.match(/\b\d{5}\b/);
  return match ? match[0] : undefined;
}