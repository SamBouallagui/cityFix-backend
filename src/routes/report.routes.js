const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const {
  createReport,
  getReports,
  updateReportStatus,
  getNearbyReports,
} = require('../controllers/report.controller');

router.use(verifyToken); //verify token on whole router insteaf of on every api
router.post('/', requireRole('citizen'), createReport);
router.get('/', getReports);
router.get('/nearby', getNearbyReports);
router.patch('/:id/status', requireRole('agent'), updateReportStatus);

module.exports = router;
