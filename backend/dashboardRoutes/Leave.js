const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// MYSQL CONNECTION
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'earist_hris',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// LEAVE TABLE ROUTES
// GET all leave types
router.get('/leave_table', (req, res) => {
  console.log('GET request to /leave_table');
  db.query('SELECT * FROM leave_table', (err, results) => {
    if (err) {
      console.error('Error fetching leave_table:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Leave table results:', results);
    res.json(results);
  });
});

// CREATE a new leave type
router.post('/leave_table', (req, res) => {
  const { leave_description, leave_code, leave_hours } = req.body;
  console.log('POST request to /leave_table:', req.body);
  
  if (!leave_description || !leave_code || leave_hours === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO leave_table (leave_description, leave_code, leave_hours) VALUES (?, ?, ?)';
  db.query(query, [leave_description, leave_code, leave_hours], (err, result) => {
    if (err) {
      console.error('Error creating leave_table entry:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Leave table entry created:', result.insertId);
    res.json({ id: result.insertId, leave_description, leave_code, leave_hours });
  });
});

// UPDATE a leave type
router.put('/leave_table/:id', (req, res) => {
  const { id } = req.params;
  const { leave_description, leave_code, leave_hours } = req.body;
  console.log('PUT request to /leave_table/' + id, req.body);

  const query = 'UPDATE leave_table SET leave_description = ?, leave_code = ?, leave_hours = ? WHERE id = ?';
  db.query(query, [leave_description, leave_code, leave_hours, id], (err, result) => {
    if (err) {
      console.error('Error updating leave_table:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    res.json({ id, leave_description, leave_code, leave_hours });
  });
});

// DELETE a leave type
router.delete('/leave_table/:id', (req, res) => {
  const { id } = req.params;
  console.log('DELETE request to /leave_table/' + id);

  const query = 'DELETE FROM leave_table WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting leave_table entry:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    res.json({ message: 'Deleted successfully' });
  });
});

// LEAVE ASSIGNMENT ROUTES
// GET all leave assignments
router.get('/leave_assignment', (req, res) => {
  console.log('GET request to /leave_assignment');
  db.query('SELECT * FROM leave_assignment', (err, results) => {
    if (err) {
      console.error('Error fetching leave_assignment:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// CREATE a new leave assignment
router.post('/leave_assignment', (req, res) => {
  const { leave_code, employeeNumber } = req.body;
  console.log('POST request to /leave_assignment:', req.body);

  if (!leave_code || !employeeNumber) {
    return res.status(400).json({ error: 'Missing required fields: leave_code and employeeNumber' });
  }

  const query = 'INSERT INTO leave_assignment (leave_code, employeeNumber) VALUES (?, ?)';
  db.query(query, [leave_code, employeeNumber], (err, result) => {
    if (err) {
      console.error('Error creating leave_assignment:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Leave assignment created:', result.insertId);
    res.json({ id: result.insertId, leave_code, employeeNumber });
  });
});

// UPDATE a leave assignment
router.put('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  const { leave_code, employeeNumber } = req.body;
  console.log('PUT request to /leave_assignment/' + id, req.body);

  const query = 'UPDATE leave_assignment SET leave_code = ?, employeeNumber = ? WHERE id = ?';
  db.query(query, [leave_code, employeeNumber, id], (err, result) => {
    if (err) {
      console.error('Error updating leave_assignment:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave assignment not found' });
    }
    res.json({ id, leave_code, employeeNumber });
  });
});

// DELETE a leave assignment
router.delete('/leave_assignment/:id', (req, res) => {
  const { id } = req.params;
  console.log('DELETE request to /leave_assignment/' + id);

  const query = 'DELETE FROM leave_assignment WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting leave_assignment:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave assignment not found' });
    }
    res.json({ message: 'Deleted successfully' });
  });
});

// NOTIFICATIONS ROUTES
// GET all notifications
router.get('/notifications', (req, res) => {
  console.log('GET request to /notifications');
  const query = `
    SELECT * FROM notifications 
    WHERE recipient_role = 'admin' OR recipient_role = 'all'
    ORDER BY created_at DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// CREATE a new notification
router.post('/notifications', (req, res) => {
  const { title, message, type, recipient_role, related_id } = req.body;
  console.log('POST request to /notifications:', req.body);

  const query = `
    INSERT INTO notifications (title, message, type, recipient_role, related_id, is_read, created_at) 
    VALUES (?, ?, ?, ?, ?, 0, NOW())
  `;
  db.query(query, [title, message, type, recipient_role, related_id], (err, result) => {
    if (err) {
      console.error('Error creating notification:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Notification created:', result.insertId);
    res.json({ id: result.insertId, title, message, type, recipient_role, related_id });
  });
});

// Mark notification as read
router.put('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  console.log('PUT request to mark notification as read:', id);

  const query = 'UPDATE notifications SET is_read = 1 WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error marking notification as read:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

// Get unread notification count
router.get('/notifications/unread/count', (req, res) => {
  console.log('GET request to /notifications/unread/count');
  const query = `
    SELECT COUNT(*) as count FROM notifications 
    WHERE (recipient_role = 'admin' OR recipient_role = 'all') AND is_read = 0
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching unread notification count:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ count: results[0].count });
  });
});

// LEAVE REQUEST ROUTES
// GET all leave requests
router.get('/leave_request', (req, res) => {
  console.log('GET request to /leave_request');
  db.query('SELECT * FROM leave_request ORDER BY leave_date DESC', (err, results) => {
    if (err) {
      console.error('Error fetching leave_request:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Leave requests found:', results.length);
    res.json(results);
  });
});

// CREATE a new leave request
router.post('/leave_request', (req, res) => {
  const { employeeNumber, leave_code, leave_date, status = '0' } = req.body;
  console.log('POST request to /leave_request:', req.body);
  
  // Validate required fields
  if (!employeeNumber || !leave_code || !leave_date) {
    return res.status(400).json({ 
      error: 'Missing required fields: employeeNumber, leave_code, and leave_date are required' 
    });
  }

  // Validate status value
  const validStatuses = ['0', '1', '2', '3'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status value. Must be one of: 0 (Pending), 1 (Manager Approved), 2 (HR Approved), 3 (Denied)' 
    });
  }

  // Check for duplicate leave request for the same date and employee
  const checkQuery = 'SELECT * FROM leave_request WHERE employeeNumber = ? AND leave_date = ?';
  db.query(checkQuery, [employeeNumber, leave_date], (err, existing) => {
    if (err) {
      console.error('Error checking for duplicate leave request:', err);
      return res.status(500).json({ error: err.message });
    }

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'A leave request already exists for this date' 
      });
    }

    // Create the leave request
    const query = 'INSERT INTO leave_request (employeeNumber, leave_code, leave_date, status, created_at) VALUES (?, ?, ?, ?, NOW())';
    db.query(query, [employeeNumber, leave_code, leave_date, status], (err, result) => {
      if (err) {
        console.error('Error creating leave_request:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const leaveRequestId = result.insertId;
      console.log('Leave request created successfully:', leaveRequestId);

      // Get leave type description for notification
      const getLeaveTypeQuery = 'SELECT leave_description FROM leave_table WHERE leave_code = ?';
      db.query(getLeaveTypeQuery, [leave_code], (err, leaveTypeResults) => {
        const leaveDescription = leaveTypeResults && leaveTypeResults.length > 0 
          ? leaveTypeResults[0].leave_description 
          : leave_code;

        // Create notification for admin
        const notificationTitle = 'New Leave Request Submitted';
        const notificationMessage = `Employee ${employeeNumber} has submitted a new ${leaveDescription} request for ${leave_date}`;
        
        const notificationQuery = `
          INSERT INTO notifications (title, message, type, recipient_role, related_id, is_read, created_at) 
          VALUES (?, ?, 'leave_request', 'admin', ?, 0, NOW())
        `;
        
        db.query(notificationQuery, [notificationTitle, notificationMessage, leaveRequestId], (err, notifResult) => {
          if (err) {
            console.error('Error creating notification:', err);
            // Don't fail the leave request creation if notification fails
          } else {
            console.log('Notification created for new leave request:', notifResult.insertId);
          }
        });
      });

      res.json({ id: leaveRequestId, employeeNumber, leave_code, leave_date, status });
    });
  });
});

// UPDATE a leave request
router.put('/leave_request/:id', (req, res) => {
  const { id } = req.params;
  const { employeeNumber, leave_code, leave_date, status } = req.body;
  console.log('PUT request to /leave_request/' + id, req.body);

  // Validate status value if provided
  if (status) {
    const validStatuses = ['0', '1', '2', '3'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value. Must be one of: 0 (Pending), 1 (Manager Approved), 2 (HR Approved), 3 (Denied)' 
      });
    }
  }

  // Get current leave request data for comparison
  const getCurrentQuery = 'SELECT * FROM leave_request WHERE id = ?';
  db.query(getCurrentQuery, [id], (err, currentResults) => {
    if (err) {
      console.error('Error fetching current leave request:', err);
      return res.status(500).json({ error: err.message });
    }

    if (currentResults.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    const currentRequest = currentResults[0];
    
    const query = 'UPDATE leave_request SET employeeNumber = ?, leave_code = ?, leave_date = ?, status = ? WHERE id = ?';
    db.query(query, [employeeNumber, leave_code, leave_date, status, id], (err, result) => {
      if (err) {
        console.error('Error updating leave_request:', err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }

      // Create notification if status changed
      if (currentRequest.status !== status) {
        let statusText = '';
        switch (status) {
          case '1': statusText = 'approved by manager'; break;
          case '2': statusText = 'approved by HR'; break;
          case '3': statusText = 'denied'; break;
          default: statusText = 'updated'; break;
        }

        const notificationTitle = 'Leave Request Status Updated';
        const notificationMessage = `Leave request for Employee ${employeeNumber} has been ${statusText}`;
        
        const notificationQuery = `
          INSERT INTO notifications (title, message, type, recipient_role, related_id, is_read, created_at) 
          VALUES (?, ?, 'leave_status_update', 'staff', ?, 0, NOW())
        `;
        
        db.query(notificationQuery, [notificationTitle, notificationMessage, id], (err, notifResult) => {
          if (err) {
            console.error('Error creating status update notification:', err);
          } else {
            console.log('Status update notification created:', notifResult.insertId);
          }
        });
      }

      console.log('Leave request updated successfully');
      res.json({ id, employeeNumber, leave_code, leave_date, status });
    });
  });
});

// DELETE a leave request
router.delete('/leave_request/:id', (req, res) => {
  const { id } = req.params;
  console.log('DELETE request to /leave_request/' + id);

  const query = 'DELETE FROM leave_request WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting leave_request:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    console.log('Leave request deleted successfully');
    res.json({ message: 'Deleted successfully' });
  });
});

module.exports = router;