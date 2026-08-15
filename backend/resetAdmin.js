import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './config/db.js';

dotenv.config();

async function resetAdmin() {
  const username = 'admin';
  const email = 'dipnarayanghosh6@gmail.com';   // Put your desired email here
  const password = 'Dip@1410';      // Put your desired password here

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Delete existing admin account to avoid conflicts
    await pool.query(
      "DELETE FROM users WHERE role = 'admin' OR LOWER(email) = $1",
      [email.toLowerCase().trim()]
    );

    // Insert fresh admin account
    const res = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, username, email, role`,
      [username.trim(), email.toLowerCase().trim(), hash]
    );

    console.log('\n✅ Admin account created successfully:');
    console.log('------------------------------------');
    console.log('Username :', res.rows[0].username);
    console.log('Email    :', res.rows[0].email);
    console.log('Password :', password);
    console.log('Role     :', res.rows[0].role);
    console.log('------------------------------------\n');
  } catch (err) {
    console.error('❌ Failed to reset admin:', err.message);
  } finally {
    await pool.end();
  }
}

resetAdmin();