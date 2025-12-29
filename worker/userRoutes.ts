import { Hono } from "hono";
import { Env, getAppController } from "./core-utils";
import { ingestGeoJSON } from "./geojson-loader";
import { PRESET_LANDMARKS } from "./gazetteer";
import { Landmark } from "./types";
import * as h3 from "h3-js";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/hub/geofences', async (c) => {
    const controller = getAppController(c.env);
    const fences = await controller.listGeofences();
    return c.json({ success: true, data: fences });
  });
  app.post('/api/hub/geofences/ingest', async (c) => {
    try {
      const geojson = await c.req.json();
      const fences = ingestGeoJSON(geojson);
      const controller = getAppController(c.env);
      for (const fence of fences) {
        await controller.upsertGeofence(fence);
      }
      return c.json({ success: true, count: fences.length });
    } catch (error: any) {
      return c.json({ success: false, error: error.message }, 400);
    }
  });
  app.get('/api/hub/landmarks', async (c) => {
    const controller = getAppController(c.env);
    const landmarks = await controller.listLandmarks();
    return c.json({ success: true, data: landmarks });
  });
  app.post('/api/hub/landmarks/seed', async (c) => {
    const controller = getAppController(c.env);
    for (const p of PRESET_LANDMARKS) {
      const landmark: Landmark = {
        id: p.id!,
        name: p.name!,
        category: p.category!,
        address: p.address!,
        lat: p.lat!,
        lng: p.lng!,
        h3Index: h3.latLngToCell(p.lat!, p.lng!, 9)
      };
      await controller.upsertLandmark(landmark);
    }
    return c.json({ success: true, count: PRESET_LANDMARKS.length });
  });
  app.get('/api/hub/geofences/at', async (c) => {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');
    const controller = getAppController(c.env);
    const fences = await controller.getGeofencesAt(lat, lng);
    return c.json({ success: true, data: fences });
  });
  app.get('/api/hub/events', async (c) => {
    const controller = getAppController(c.env);
    const category = c.req.query('category') as any;
    const location = c.req.query('location') as any;
    const neighborhood = c.req.query('neighborhood');
    const neighborhoodId = c.req.query('neighborhoodId');
    const landmarkId = c.req.query('landmarkId');
    const searchQuery = c.req.query('q');
    const lat = c.req.query('lat') ? parseFloat(c.req.query('lat')!) : undefined;
    const lng = c.req.query('lng') ? parseFloat(c.req.query('lng')!) : undefined;
    const events = await controller.listEvents({
      category, location, neighborhood, neighborhoodId, landmarkId, searchQuery, lat, lng
    });
    return c.json({ success: true, data: events });
  });
  app.get('/api/hub/stats', async (c) => {
    const controller = getAppController(c.env);
    const stats = await controller.getSyncStats();
    return c.json({ success: true, data: stats });
  });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
  app.all('/api/chat/:sessionId/*', async (c) => {
    return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
  });
}