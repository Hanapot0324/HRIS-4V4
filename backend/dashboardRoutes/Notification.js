const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// MYSQL CONNECTION
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "earist_hris",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


// Get all notifications (for Admin)
router.get('/notifications/admin', (req, res) => {
  db.query("SELECT * FROM notifications ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get notifications for specific employee (for Staff)
router.get('/notifications/user/:employeeNumber', (req, res) => {
  db.query("SELECT * FROM notifications WHERE employeeNumber = ? ORDER BY created_at DESC",
    [req.params.employeeNumber],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
});

// Mark as read
router.put('/notifications/:id/read', (req, res) => {
  db.query("UPDATE notifications SET read_status = 1 WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Notification marked as read" });
  });
});





module.exports = router;
