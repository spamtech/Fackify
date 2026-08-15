import bcrypt from 'bcryptjs';
import { query, pool } from '../config/db.js';

const createAdmin = async () => {
  const username = process.argv[2] || 'admin';
  const email = process.argv[3] || 'admin@fackify.com';
  const password = process.argv[4] || 'Admin@123456';

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
      [username, email, hashedPassword]
    );

    console.log(` Admin user created successfully:\n Email: ${email}\n Password: ${password}`);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await pool.end();
  }
};

createAdmin();