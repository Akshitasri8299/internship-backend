const pool = require('../config/db');

const UserModel = {
  async create({ name, email, hashedPassword, role }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashedPassword, role]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async countAll() {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    return rows[0].count;
  },

  async countByRole(role) {
    const { rows } = await pool.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE role = $1 AND is_active = TRUE',
      [role]
    );
    return rows[0].count;
  }
};

module.exports = UserModel;
