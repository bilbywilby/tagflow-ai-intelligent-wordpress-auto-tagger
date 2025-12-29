import { Hono } from "hono";
import { Env, getAppController } from "./core-utils";
import { ingestGeoJSON, INITIAL_VALLEY_BOUNDARIES } from "./geojson-loader";
import { PRESET_LANDMARKS } from "./gazetteer";
import { Landmark } from "./types";
import { generateMorningBriefing } from "./intelligence";
import * as h3 from "h3-js";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/hub/geofences', async (c) => {
    const controller = getAppController(c.env);
    const fences = await controller.listGeofences();
    return c.json({ success: true, data: fences });
  });
  app.get('/api/hub/landmarks', async (c) => {
    const controller = getAppController(c.env);
    const landmarks = await controller.listLandmarks();
    return c.json({ success: true, data: landmarks });
  });
  app.get('/api/hub/venues/nearby', async (c) => {
    const lat = parseFloat(c.req.query('lat') || '0');
    const lng = parseFloat(c.req.query('lng') || '0');
    const radius = parseInt(c.req.query('radius') || '1');
    const controller = getAppController(c.env);
    const centerCell = h3.latLngToCell(lat, lng, 9);
    const nearbyCells = h3.gridDisk(centerCell, radius);
    const allLandmarks = await controller.listLandmarks();
    const matches = allLandmarks.filter(l => nearbyCells.includes(l.h3Index));
    return c.json({ success: true, data: matches });
  });
  app.get('/api/hub/events', async (c) => {
    const controller = getAppController(c.env);
    const category = c.req.query('category') as any;
    const location = c.req.query('location') as any;
    const neighborhood = c.req.query('neighborhood');
    const neighborhoodId = c.req.query('neighborhoodId');
    const landmarkId = c.req.query('landmarkId');
    const searchQuery = c.req.query('q');
    const events = await controller.listEvents({
      category, location, neighborhood, neighborhoodId, landmarkId, searchQuery
    });
    return c.json({ success: true, data: events });
  });
  app.get('/api/hub/briefing', async (c) => {
    const controller = getAppController(c.env);
    let briefing: any = await controller.getMorningBriefing();
    // Auto-generate if missing or older than 12 hours
    const isStale = briefing && (Date.now() - new Date(briefing.date).getTime() > 12 * 60 * 60 * 1000);
    if (!briefing || isStale) {
      briefing = await generateMorningBriefing(c.env, controller);
    }
    return c.json({ success: true, data: briefing });
  });
  app.get('/api/hub/stats', async (c) => {
    const controller = getAppController(c.env);
    const stats = await controller.getSyncStats();
    const briefing = await controller.getMorningBriefing();
    // Auto-seeding check
    if (stats.landmarks === 0 || stats.geofences === 0) {
      console.log("Seeding regional database...");
      for (const p of PRESET_LANDMARKS) {
        if (!p.id || !p.lat || !p.lng) continue;
        const landmark: Landmark = {
          id: p.id,
          name: p.name!,
          category: p.category as any,
          address: p.address!,
          lat: p.lat,
          lng: p.lng,
          h3Index: h3.latLngToCell(p.lat, p.lng, 9)
        };
        await controller.upsertLandmark(landmark);
      }
      const defaultFences = ingestGeoJSON(INITIAL_VALLEY_BOUNDARIES);
      for (const fence of defaultFences) {
        await controller.upsertGeofence(fence);
      }
      const newStats = await controller.getSyncStats();
      return c.json({
        success: true,
        data: { ...newStats, briefingStatus: briefing?.date || null },
        seeded: true
      });
    }
    return c.json({
      success: true,
      data: { ...stats, briefingStatus: briefing?.date || null }
    });
  });
}
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
  app.all('/api/chat/:sessionId/*', async (c) => {
    return c.json({ error: "Use specialized endpoints for TagFlow" }, 404);
  });
}