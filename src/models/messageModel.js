const db = require("../db");

async function createMessage({ user_id, title, body }) {
    const res = await db.query(
        `INSERT INTO messages (user_id, title, body) VALUES ($1, $2, $3) RETURNING id, user_id, title, body, created_at`, 
        [user_id, title, body]
    );
    return res.rows[0];
}

async function deleteMessage(id, user_id) {
    const res = await db.query(
        `DELETE FROM messages WHERE id=$1 AND user_id=$2 RETURNING *`, 
    [id, user_id]);
    return res.rowCount > 0;
}

async function listMessages() {
    const res = await db.query(
        `SELECT m.id, m.title, m.body, m.created_at, m.user_id, u.first_name, u.last_name
        FROM messages m
        JOIN users u ON u.id = m.user_id
        ORDER BY m.created_at DESC
        LIMIT 50`
    );
    return res.rows;
}

module.exports = { createMessage, deleteMessage, listMessages };