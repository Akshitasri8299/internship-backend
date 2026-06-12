const asyncHandler = require('../utils/asyncHandler');
const UserModel = require('../models/userModel');
const InternshipModel = require('../models/internshipModel');
const ApplicationModel = require('../models/applicationModel');

/**
 * @desc Recruiter dashboard statistics
 * @route GET /dashboard/recruiter
 * @access Recruiter
 */
const getRecruiterDashboard = asyncHandler(async (req, res) => {
  const recruiterId = req.user.id;

  const [totalInternships, totalApplicants, shortlisted] = await Promise.all([
    InternshipModel.countByRecruiter(recruiterId),
    ApplicationModel.countByRecruiter(recruiterId),
    ApplicationModel.countShortlistedByRecruiter(recruiterId)
  ]);

  res.status(200).json({
    success: true,
    data: {
      total_internships: totalInternships,
      total_applicants: totalApplicants,
      shortlisted_candidates: shortlisted
    }
  });
});

/**
 * @desc Admin dashboard statistics
 * @route GET /dashboard/admin
 * @access Admin
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalInternships, activeRecruiters] = await Promise.all([
    UserModel.countAll(),
    InternshipModel.countAll(),
    UserModel.countByRole('recruiter')
  ]);

  res.status(200).json({
    success: true,
    data: {
      total_users: totalUsers,
      total_internships: totalInternships,
      active_recruiters: activeRecruiters
    }
  });
});

module.exports = { getRecruiterDashboard, getAdminDashboard };
