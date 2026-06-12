const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getApplicants
} = require('../controllers/internshipController');
const { applyToInternship } = require('../controllers/applicationController');

const protect = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Internships
 *   description: Internship listing management
 */

/**
 * @swagger
 * /internships:
 *   post:
 *     summary: Create a new internship
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, location]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               stipend:
 *                 type: integer
 *               location:
 *                 type: string
 *               skills_required:
 *                 type: array
 *                 items:
 *                   type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [open, closed, draft]
 *     responses:
 *       201:
 *         description: Internship created
 *       403:
 *         description: Forbidden - requires recruiter or admin role
 */
router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('stipend').optional().isInt({ min: 0 }).withMessage('Stipend must be a non-negative integer'),
    body('skills_required').optional().isArray().withMessage('skills_required must be an array'),
    body('deadline').optional().isISO8601().withMessage('Deadline must be a valid date'),
    body('status').optional().isIn(['open', 'closed', 'draft']).withMessage('Invalid status')
  ],
  validate,
  createInternship
);

/**
 * @swagger
 * /internships:
 *   get:
 *     summary: Get all internships (search, filter, sort, paginate)
 *     tags: [Internships]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated list, e.g. nodejs,react
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, draft]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, deadline, stipend, title]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of internships with pagination metadata
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validate,
  getInternships
);

/**
 * @swagger
 * /internships/{id}:
 *   get:
 *     summary: Get a single internship by ID
 *     tags: [Internships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Internship details
 *       404:
 *         description: Internship not found
 */
router.get('/:id', getInternshipById);

/**
 * @swagger
 * /internships/{id}:
 *   put:
 *     summary: Update an internship
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Internship updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Internship not found
 */
router.put('/:id', protect, authorize('recruiter', 'admin'), updateInternship);

/**
 * @swagger
 * /internships/{id}:
 *   delete:
 *     summary: Delete an internship
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Internship deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Internship not found
 */
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteInternship);

/**
 * @swagger
 * /internships/{id}/applicants:
 *   get:
 *     summary: Get all applicants for an internship
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
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
 *         description: List of applicants
 *       403:
 *         description: Forbidden
 */
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), getApplicants);

/**
 * @swagger
 * /internships/{id}/apply:
 *   post:
 *     summary: Apply to an internship
 *     tags: [Internships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resume_url:
 *                 type: string
 *                 example: https://example.com/resume.pdf
 *     responses:
 *       201:
 *         description: Application submitted
 *       409:
 *         description: Already applied
 */
router.post(
  '/:id/apply',
  protect,
  authorize('candidate'),
  [body('resume_url').optional().isURL().withMessage('resume_url must be a valid URL')],
  validate,
  applyToInternship
);

module.exports = router;
