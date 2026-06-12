const express = require('express');
const router = express.Router();

const { getRecruiterDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistics dashboards for recruiters and admins
 */

/**
 * @swagger
 * /dashboard/recruiter:
 *   get:
 *     summary: Get recruiter dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter statistics (total internships, applicants, shortlisted)
 *       403:
 *         description: Forbidden
 */
router.get('/recruiter', protect, authorize('recruiter', 'admin'), getRecruiterDashboard);

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin statistics (total users, internships, active recruiters)
 *       403:
 *         description: Forbidden
 */
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
