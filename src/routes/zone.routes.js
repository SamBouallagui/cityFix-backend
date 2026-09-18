const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const { getZonesWithCounts } = require('../controllers/zone.controller');

router.use(verifyToken);
module.exports = router;
