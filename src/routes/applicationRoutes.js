const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const { getMyApplications, updateApplicationStatus } = require('../controllers/applicationController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Candidate applications and status management
 */

/**
 * @swagger
 * /applications/me:
 *   get:
 *     summary: Get the logged-in candidate's applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of the candidate's applications
 */
router.get('/me', protect, authorize('candidate'), getMyApplications);

/**
 * @swagger
 * /applications/{id}/status:
 *   put:
 *     summary: Update an application's status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Shortlisted, Interview Scheduled, Rejected, Selected]
 *     responses:
 *       200:
 *         description: Application status updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found
 */
router.put(
  '/:id/status',
  protect,
  authorize('recruiter', 'admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateApplicationStatus
);

module.exports = router;
