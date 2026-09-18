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

module.exports = { getZonesWithCounts };
