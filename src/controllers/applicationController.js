const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const ApplicationModel = require('../models/applicationModel');
const InternshipModel = require('../models/internshipModel');

const VALID_STATUSES = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'];

/**
 * @desc Apply to an internship
 * @route POST /internships/:id/apply
 * @access Candidate
 */
const applyToInternship = asyncHandler(async (req, res) => {
  const internshipId = req.params.id;
  const { resume_url } = req.body;

  const internship = await InternshipModel.findById(internshipId);
  if (!internship) {
    throw new ApiError(404, 'Internship not found');
  }

  if (internship.status !== 'open') {
    throw new ApiError(400, 'This internship is not currently open for applications');
  }

  const existing = await ApplicationModel.findByInternshipAndCandidate(internshipId, req.user.id);
  if (existing) {
    throw new ApiError(409, 'You have already applied to this internship');
  }

  const application = await ApplicationModel.create({
    internship_id: internshipId,
    candidate_id: req.user.id,
    resume_url
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: application
  });
});

/**
 * @desc Get the logged-in candidate's applications
 * @route GET /applications/me
 * @access Candidate
 */
const getMyApplications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await ApplicationModel.findByCandidate(req.user.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

/**
 * @desc Update an application's status (shortlist, reject, etc.)
 * @route PUT /applications/:id/status
 * @access Recruiter (owner of internship), Admin
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const application = await ApplicationModel.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, 'Application not found');
  }

  const internship = await InternshipModel.findById(application.internship_id);

  if (req.user.role !== 'admin' && internship.recruiter_id !== req.user.id) {
    throw new ApiError(403, 'You are not allowed to update this application');
  }

  const updated = await ApplicationModel.updateStatus(req.params.id, status);

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: updated
  });
});

module.exports = { applyToInternship, getMyApplications, updateApplicationStatus };
