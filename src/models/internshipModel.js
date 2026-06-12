const pool = require('../config/db');

const InternshipModel = {
  async create({ recruiter_id, title, description, stipend, location, skills_required, deadline, status }) {
    const { rows } = await pool.query(
      `INSERT INTO internships
        (recruiter_id, title, description, stipend, location, skills_required, deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 'open'))
       RETURNING *`,
      [recruiter_id, title, description, stipend || 0, location, skills_required || [], deadline || null, status]
    );
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM internships WHERE id = $1', [id]);
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['title', 'description', 'stipend', 'location', 'skills_required', 'deadline', 'status'];
    const sets = [];
    const values = [];
    let idx = 1;

    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    }

    if (sets.length === 0) return this.findById(id);

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE internships SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query('DELETE FROM internships WHERE id = $1 RETURNING id', [id]);
    return rows[0];
  },

  /**
   * Search/filter/paginate internships.
   * filters: { location, skills (array), status, search }
   * pagination: { page, limit, sortBy, order }
   */
  async findAll({ location, skills, status, search, page = 1, limit = 10, sortBy = 'created_at', order = 'DESC' }) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (location) {
      conditions.push(`location ILIKE $${idx}`);
      values.push(`%${location}%`);
      idx++;
    }
    if (status) {
      conditions.push(`status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (skills && skills.length > 0) {
      conditions.push(`skills_required && $${idx}::text[]`);
      values.push(skills);
      idx++;
    }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = ['created_at', 'deadline', 'stipend', 'title'];
    const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*)::int AS total FROM internships ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = countResult.rows[0].total;

    const dataQuery = `
      SELECT * FROM internships
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const dataValues = [...values, limit, offset];
    const { rows } = await pool.query(dataQuery, dataValues);

    return {
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async countAll() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM internships');
    return rows[0].count;
  },

  async countByRecruiter(recruiterId) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM internships WHERE recruiter_id = $1',
      [recruiterId]
    );
    return rows[0].count;
  }
};

module.exports = InternshipModel;
