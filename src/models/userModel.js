const db = require("../db");

async function createUser({ first_name, last_name, email, password_hash, is_admin = false}) {
    try {
        const res = await db.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, is_admin)
            VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, is_member, is_admin, created_at`,
        [first_name, last_name, email.toLowerCase(), password_hash, is_admin]
        );
        return res.rows[0];
    } catch (err) {
        if (err.code === "23505") {
            throw new Error("Email already exists");
        }
        throw err;
    }
}

async function findByEmail(email) {
    const res = await db.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email.toLowerCase()]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
}

async function findById(id) {
    const res = await db.query(`SELECT * FROM users WHERE id=$1`, [id]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
}

async function setMember(userId, isMember = true) {
    const res = await db.query(`UPDATE users set is_member=$1 WHERE id=$2 RETURNING *`, [isMember, userId]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
}

async function setAdmin(userId, isAdmin = true) {
    const res = await db.query(`UPDATE users SET is_admin=$1 WHERE id=$2 RETURNING *`, [isAdmin, userId]);
    if (res.rowCount === 0) return null;
    return res.rows[0];
}

module.exports = { createUser, findByEmail, findById, setMember, setAdmin };