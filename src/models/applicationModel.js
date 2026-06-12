const pool = require('../config/db');

const ApplicationModel = {
  async create({ internship_id, candidate_id, resume_url }) {
    const { rows } = await pool.query(
      `INSERT INTO applications (internship_id, candidate_id, resume_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [internship_id, candidate_id, resume_url || null]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM applications WHERE id = $1', [id]);
    return rows[0];
  },

  async findByInternshipAndCandidate(internshipId, candidateId) {
    const { rows } = await pool.query(
      'SELECT * FROM applications WHERE internship_id = $1 AND candidate_id = $2',
      [internshipId, candidateId]
    );
    return rows[0];
  },

  async findByCandidate(candidateId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS total FROM applications WHERE candidate_id = $1',
      [candidateId]
    );
    const { rows } = await pool.query(
      `SELECT a.*, i.title AS internship_title, i.location, i.stipend, i.status AS internship_status
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE a.candidate_id = $1
       ORDER BY a.applied_at DESC
       LIMIT $2 OFFSET $3`,
      [candidateId, limit, offset]
    );
    return {
      data: rows,
      pagination: {
        total: countResult.rows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  },

  async findByInternship(internshipId, { page = 1, limit = 10, status } = {}) {
    const offset = (page - 1) * limit;
    const conditions = ['a.internship_id = $1'];
    const values = [internshipId];
    let idx = 2;

    if (status) {
      conditions.push(`a.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM applications a ${whereClause}`,
      values
    );

    const dataValues = [...values, limit, offset];
    const { rows } = await pool.query(
      `SELECT a.*, u.name AS candidate_name, u.email AS candidate_email
       FROM applications a
       JOIN users u ON u.id = a.candidate_id
       ${whereClause}
       ORDER BY a.applied_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      dataValues
    );

    return {
      data: rows,
      pagination: {
        total: countResult.rows[0].total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    };
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0];
  },

  async countByInternship(internshipId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM applications WHERE internship_id = $1',
      [internshipId]
    );
    return rows[0].count;
  },

  async countByRecruiter(recruiterId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE i.recruiter_id = $1`,
      [recruiterId]
    );
    return rows[0].count;
  },

  async countShortlistedByRecruiter(recruiterId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM applications a
       JOIN internships i ON i.id = a.internship_id
       WHERE i.recruiter_id = $1 AND a.status = 'Shortlisted'`,
      [recruiterId]
    );
    return rows[0].count;
  }
};

module.exports = ApplicationModel;
