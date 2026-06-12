const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const InternshipModel = require('../models/internshipModel');
const ApplicationModel = require('../models/applicationModel');

/**
 * @desc Create a new internship
 * @route POST /internships
 * @access Recruiter, Admin
 */
const createInternship = asyncHandler(async (req, res) => {
  const { title, description, stipend, location, skills_required, deadline, status } = req.body;

  const internship = await InternshipModel.create({
    recruiter_id: req.user.id,
    title,
    description,
    stipend,
    location,
    skills_required,
    deadline,
    status
  });

  res.status(201).json({
    success: true,
    message: 'Internship created successfully',
    data: internship
  });
});

/**
 * @desc Get all internships with search, filter, sort, and pagination
 * @route GET /internships?location=remote&skills=nodejs,react&status=open&search=backend&page=1&limit=10&sortBy=created_at&order=desc
 * @access Public
 */
const getInternships = asyncHandler(async (req, res) => {
  const { location, skills, status, search, page, limit, sortBy, order } = req.query;

  const skillsArray = skills
    ? skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
    : undefined;

  const result = await InternshipModel.findAll({
    location,
    skills: skillsArray,
    status,
    search,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    sortBy,
    order
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

/**
 * @desc Get a single internship by ID
 * @route GET /internships/:id
 * @access Public
 */
const getInternshipById = asyncHandler(async (req, res) => {
  const internship = await InternshipModel.findById(req.params.id);
  if (!internship) {
    throw new ApiError(404, 'Internship not found');
  }
  res.status(200).json({ success: true, data: internship });
});

/**
 * @desc Update an internship
 * @route PUT /internships/:id
 * @access Recruiter (owner), Admin
 */
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await InternshipModel.findById(req.params.id);
  if (!internship) {
    throw new ApiError(404, 'Internship not found');
  }

  if (req.user.role !== 'admin' && internship.recruiter_id !== req.user.id) {
    throw new ApiError(403, 'You are not allowed to update this internship');
  }

  const updated = await InternshipModel.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Internship updated successfully',
    data: updated
  });
});

/**
 * @desc Delete an internship
 * @route DELETE /internships/:id
 * @access Recruiter (owner), Admin
 */
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await InternshipModel.findById(req.params.id);
  if (!internship) {
    throw new ApiError(404, 'Internship not found');
  }

  if (req.user.role !== 'admin' && internship.recruiter_id !== req.user.id) {
    throw new ApiError(403, 'You are not allowed to delete this internship');
  }

  await InternshipModel.delete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Internship deleted successfully'
  });
});

/**
 * @desc Get all applicants for a specific internship
 * @route GET /internships/:id/applicants
 * @access Recruiter (owner), Admin
 */
const getApplicants = asyncHandler(async (req, res) => {
  const internship = await InternshipModel.findById(req.params.id);
  if (!internship) {
    throw new ApiError(404, 'Internship not found');
  }

  if (req.user.role !== 'admin' && internship.recruiter_id !== req.user.id) {
    throw new ApiError(403, 'You are not allowed to view applicants for this internship');
  }

  const { page, limit, status } = req.query;
  const result = await ApplicationModel.findByInternship(req.params.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 10,
    status
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

module.exports = {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  deleteInternship,
  getApplicants
};
