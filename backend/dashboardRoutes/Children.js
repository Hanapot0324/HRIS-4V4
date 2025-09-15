const express = require("express");
const multer = require("multer");
const fs = require("fs"); // Import file system module
const router = express.Router();
const mysql = require("mysql2");
const xlsx = require("xlsx");



//MYSQL CONNECTION
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'earist_hris',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function: insert into audit_trail
function logAuditTrail(employee_number, action, table_name, record_id, description, req) {
  const ip_address = req.ip || null;
  const user_agent = req.headers['user-agent'] || null;

  const query = `
    INSERT INTO audit_trail 
      (employee_number, action, table_name, record_id, description, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [employee_number, action, table_name, record_id, description, ip_address, user_agent], (err) => {
    if (err) console.error("Error inserting audit trail:", err);
  });
}


// CRUD for Children
router.get("/children-table", (req, res) => {
  const query = "SELECT * FROM children_table";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching children" });

    // Log a general "view all" action
    logAuditTrail(
      "SYSTEM", // no specific employee
      "VIEW",
      "children_table",
      null,
      `Viewed all children records (count: ${results.length})`,
      req
    );

    res.json(results);
  });
});


router.get("/children-table/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM children_table WHERE id = ?";
  db.query(query, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching child" });
    if (rows.length === 0) return res.status(404).json({ error: "Child not found" });

    const child = rows[0];

    // Audit log with the correct person_id
    logAuditTrail(
      child.person_id,
      "VIEW",
      "children_table",
      id,
      `Viewed child ID ${id} for employee ${child.person_id}`,
      req
    );

    res.json(child);
  });
});


router.post("/children-table", (req, res) => {
  const { childrenFirstName, childrenMiddleName, childrenLastName, childrenNameExtension, dateOfBirth, person_id } = req.body;

  const query = `INSERT INTO children_table 
    (childrenFirstName, childrenMiddleName, childrenLastName, childrenNameExtension, dateOfBirth, person_id) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(query, [childrenFirstName, childrenMiddleName, childrenLastName, childrenNameExtension, dateOfBirth, person_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error adding child" });

    // Audit log
    logAuditTrail(
      person_id,
      "CREATE",
      "children_table",
      result.insertId,
      `Added child: ${childrenFirstName} ${childrenLastName}`,
      req
    );

    res.status(201).json({ message: "Child added", id: result.insertId });
  });
});


router.put("/children-table/:id", (req, res) => {
  const { id } = req.params;
  const { childrenFirstName, childrenMiddleName, childrenLastName, childrenNameExtension, dateOfBirth, person_id } = req.body;

  const query = `UPDATE children_table 
    SET childrenFirstName = ?, childrenMiddleName = ?, childrenLastName = ?, childrenNameExtension = ?, dateOfBirth = ?, person_id = ? 
    WHERE id = ?`;

  db.query(query, [childrenFirstName, childrenMiddleName, childrenLastName, childrenNameExtension, dateOfBirth, person_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error updating child" });

    // Audit log
    logAuditTrail(
      person_id,
      "UPDATE",
      "children_table",
      id,
      `Updated child ID ${id}: ${childrenFirstName} ${childrenLastName}`,
      req
    );

    res.json({ message: "Child updated" });
  });
});




router.delete("/children-table/:id", (req, res) => {
  const { id } = req.params;

  // First fetch the record so we know the person_id
  const selectQuery = `SELECT person_id FROM children_table WHERE id = ?`;

  db.query(selectQuery, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error fetching child before delete" });
    if (rows.length === 0) return res.status(404).json({ error: "Child not found" });

    const person_id = rows[0].person_id;

    // Now delete the record
    const deleteQuery = `DELETE FROM children_table WHERE id = ?`;
    db.query(deleteQuery, [id], (err2, result) => {
      if (err2) return res.status(500).json({ error: "Error deleting child" });

      // Audit log (use person_id as employee_number)
      logAuditTrail(
        person_id,
        "DELETE",
        "children_table",
        id,
        `Deleted child with ID ${id} for employee ${person_id}`,
        req
      );

      res.json({ message: "Child deleted" });
    });
  });
});



module.exports = router;
