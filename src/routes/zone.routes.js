const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { getZonesWithCounts, createZone, getZoneReports } = require('../controllers/zone.controller');

router.use(verifyToken); // every route below needs a valid JWT

// list zones with per-zone report counts (used by the agent dashboard map)
router.get('/', getZonesWithCounts);

// agents only: POST a zone polygon drawn on the agent dashboard map
router.post('/', requireRole('agent'), createZone);

// reports whose location point falls inside the zone's polygon (used by "analyze zone")
router.get('/:id/reports', getZoneReports);

module.exports = router;