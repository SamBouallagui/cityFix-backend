const { Report, User } = require('../models');
const sequelize = require('../config/database');

async function createReport(req, res) {
  try {
    const { title, description, category, latitude, longitude, photoUrl } = req.body;
    if (!title || !category || latitude == undefined || longitude == undefined) {
      return res.status(400).json({ error: 'title,category,latitude and longitude required' });
    }
    const report = await Report.create({
      title,
      description,
      category,
      photoUrl: photoUrl || null, // stores the base64 data URL string directly, or null if no photo was taken
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], //order used by PostGIS
      },
      userId: req.user.id,
    });
    return res.status(201).json(report);
  } catch (err) {
    console.error('error creating report', err);
    return res.status(500).json({ error: 'could not create report' });
  }
}
//list all reports
async function getReports(req, res) {
  try {
    const where = req.user.role === 'agent' ? {} : { userId: req.user.id };
    const reports = await Report.findAll({
      where,
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(reports);
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ error: 'Could not fetch reports.' });
  }
}
//agents only
async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const report = await Report.findByPk(id);
    if (!report) {
          return res.status(404).json({ error: 'Report not found.' });
    }

    report.status = status;
    await report.save();
    return res.status(200).json(report);
    } catch (err) {
        console.error('Update report error:', err);
      return res.status(500).json({ error: 'Could not update report.' });
  }
}
async function getNearbyReports(req, res) {
  try {
    const { lat, lng, radius } = req.query; // radius in meters

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'lat, lng and radius are required.' });
    }

    const results = await sequelize.query(
      `
      SELECT id, title, description, category, status,
             ST_Y(location::geometry) AS latitude,
             ST_X(location::geometry) AS longitude,
             ST_Distance(location, ST_MakePoint($lng, $lat)::geography) AS distance_meters
      FROM reports
      WHERE ST_DWithin(location, ST_MakePoint($lng, $lat)::geography, $radius)
      ORDER BY distance_meters ASC
      `,
      {
        bind: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return res.status(200).json(results);
  } catch (err) {
    console.error('Nearby reports error:', err);
    return res.status(500).json({ error: 'Could not fetch nearby reports.' });
  }
}

module.exports = { createReport, getReports, updateReportStatus, getNearbyReports };
