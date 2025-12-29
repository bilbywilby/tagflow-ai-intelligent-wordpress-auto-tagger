import * as h3 from 'h3-js';
import { H3Index, Geofence } from './types';
/**
 * Converts a Polygon to a set of H3 indexes at a specific resolution
 */
export function polygonToH3Indexes(coordinates: number[][][], resolution: number = 9): H3Index[] {
  // h3-js expects [[lat, lng], ...]
  const h3Coords = coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
  return h3.polygonToCells(h3Coords, resolution);
}
/**
 * Resolves a point to a specific H3 cell
 */
export function latLngToH3(lat: number, lng: number, resolution: number = 9): H3Index {
  return h3.latLngToCell(lat, lng, resolution);
}
/**
 * Identifies geofences that contain a specific H3 cell using an inverted index
 */
export function geofencesForPointH3(
  lat: number, 
  lng: number, 
  indexMap: Map<H3Index, Set<string>>, 
  resolution: number = 9
): string[] {
  const cell = h3.latLngToCell(lat, lng, resolution);
  const matches = indexMap.get(cell);
  return matches ? Array.from(matches) : [];
}
/**
 * Mock Registry for Lehigh Valley ZIP resolution to coordinates
 * This supports the "Text -> Space" transition for legacy news
 */
const ZIP_REGISTRY: Record<string, [number, number]> = {
  '18101': [40.6023, -75.4714], // Allentown Center
  '18104': [40.5968, -75.5269], // Allentown West
  '18018': [40.6259, -75.3705], // Bethlehem North
  '18015': [40.6083, -75.3742], // Bethlehem South
  '18042': [40.6884, -75.2202], // Easton Downtown
};
export function resolveZipToCoords(zip: string): [number, number] | null {
  return ZIP_REGISTRY[zip] || null;
}