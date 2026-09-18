const { Zone } = require('../models');
const sequelize = require('../config/database');

async function getZonesWithCounts(req, res) {
  try {
    // ST_Contains(polygon, point) to check if point are within polygon(area)
    const zones = await sequelize.query(
      `
      SELECT
        z.id,
        z.name,
        z.color,
        ST_AsGeoJSON(z.boundary) AS boundary,
        COUNT(r.id) AS report_count
      FROM zones z
      LEFT JOIN reports r
        ON ST_Contains(z.boundary::geometry, r.location::geometry)
      GROUP BY z.id
      ORDER BY z.id
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const parsed = zones.map((z) => ({
      ...z,
      boundary: JSON.parse(z.boundary),
      report_count: parseInt(z.report_count, 10),
    }));

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Get zones error:', err);
    return res.status(500).json({ error: 'Could not fetch zones.' });
  }
}

// POST /api/zones (agents only) -- save a polygon the agent drew on the map.
async function createZone(req, res) {
  try {
    const { name, color, boundary } = req.body;
    // validate: a name plus a GeoJSON Polygon like {type:'Polygon', coordinates:[ring]}
    if (!name || !boundary || boundary.type !== 'Polygon' ||
        !Array.isArray(boundary.coordinates) || boundary.coordinates.length === 0) {
      return res.status(400).json({ error: 'name and a GeoJSON Polygon boundary are required' });
    }
    // Sequelize converts this GeoJSON object into a PostGIS geography on insert
    const zone = await Zone.create({
      name,
      color: color || '#2563eb',
      boundary,
    });
    // echo the same GeoJSON the list endpoint returns (boundary as a parsed object)
    return res.status(201).json({ ...zone.toJSON(), boundary });
  } catch (err) {
    console.error('Create zone error:', err);
    return res.status(500).json({ error: 'Could not create zone.' });
  }
}

// GET /api/zones/:id/reports -- every report whose point is inside this zone.
// Returns the SAME shape as GET /reports so the frontend can reuse the Report model.
async function getZoneReports(req, res) {
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found.' });
    }

    const results = await sequelize.query(
      `
      SELECT r."id", r.title, r.description, r.category, r.status, r."photoUrl", r."createdAt",
             ST_Y(r.location::geometry) AS latitude,
             ST_X(r.location::geometry) AS longitude,
             json_build_object('type','Point','coordinates',
                json_build_array(ST_X(r.location::geometry), ST_Y(r.location::geometry))
             ) AS location,
             json_build_object('id', u."id", 'name', u.name, 'email', u.email) AS reporter
      FROM reports r
      JOIN users u ON u."id" = r."userId"
      WHERE ST_Contains(
              (SELECT z.boundary::geometry FROM zones z WHERE z."id" = $zoneId),
              r.location::geometry
            )
      ORDER BY r."createdAt" DESC
      `,
      { bind: { zoneId: +id }, type: sequelize.QueryTypes.SELECT }
    );

    return res.status(200).json(results);
  } catch (err) {
    console.error('Zone reports error:', err);
    return res.status(500).json({ error: 'Could not fetch zone reports.' });
  }
}

module.exports = { getZonesWithCounts, createZone, getZoneReports };