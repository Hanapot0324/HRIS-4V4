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

/**
 * ======================
 * GET Notifications
 * ======================
 */

// Get all notifications (admin + staff)
router.get("/notifications", (req, res) => {
  const query = `
    SELECT * FROM notifications 
    ORDER BY created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get unread notifications count
router.get("/unread/count", (req, res) => {
  const query = `
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE is_read = 0
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching unread notifications:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: results[0].count });
  });
});

/**
 * ======================
 * CREATE Notifications
 * ======================
 */

// Triggered when an announcement is created
router.post("/from-announcement", (req, res) => {
  const { announcementId, title } = req.body;
  if (!announcementId || !title) {
    return res.status(400).json({ error: "announcementId and title required" });
  }

  const query = `
    INSERT INTO notifications 
      (title, message, type, recipient_role, related_id, is_read, created_at) 
    VALUES (?, ?, 'announcement', 'all', ?, 0, NOW())
  `;
  const message = `A new announcement "${title}" has been posted.`;

  db.query(query, [title, message, announcementId], (err, result) => {
    if (err) {
      console.error("Error creating announcement notification:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, title, message, related_id: announcementId });
  });
});

// Triggered when a staff creates a leave request
router.post("/from-leave", (req, res) => {
  const { leaveRequestId, employeeNumber, leaveType, leaveDate } = req.body;
  if (!leaveRequestId || !employeeNumber) {
    return res.status(400).json({ error: "leaveRequestId and employeeNumber required" });
  }

  const query = `
    INSERT INTO notifications 
      (title, message, type, recipient_role, related_id, is_read, created_at) 
    VALUES (?, ?, 'leave_request', 'admin', ?, 0, NOW())
  `;
  const message = `Employee ${employeeNumber} submitted a ${leaveType} request for ${leaveDate}.`;

  db.query(query, ["New Leave Request Submitted", message, leaveRequestId], (err, result) => {
    if (err) {
      console.error("Error creating leave request notification:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, message, related_id: leaveRequestId });
  });
});

// ✅ Mark one notification as read
router.put("/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const query = "UPDATE notifications SET is_read = 1 WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error updating notification:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ message: "Notification marked as read", id });
  });
});

// ✅ Mark ALL as read (optional, nice to have)
router.put("/read-all", (req, res) => {
  const query = "UPDATE notifications SET is_read = 1 WHERE is_read = 0";
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error marking all notifications as read:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `${result.affectedRows} notifications marked as read` });
  });
});


module.exports = router;
