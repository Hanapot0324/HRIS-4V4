// src/components/NotificationsModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  ButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const NotificationsModal = ({
  open,
  onClose,
  announcements = [],
  notifications = [], // 🔔 leave request notifications from DB
  setSelectedAnnouncement,
  setOpenModal,
  refreshNotifications, // callback for reloading
}) => {
  const [filter, setFilter] = useState("all");

  const handleNotificationClick = async (item) => {
    if (item.type === "announcement") {
      // Existing behavior → open announcement modal
      setSelectedAnnouncement(item);
      setOpenModal(true);
    }

    if (item.type === "dbNotification") {
      // Mark as read in backend
      try {
        await axios.put(`http://localhost:5000/notifications/${item.id}/read`);
        if (refreshNotifications) refreshNotifications();
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    onClose();
  };

  // Merge announcements + DB notifications
  const merged = [
    ...announcements.map((a) => ({ ...a, type: "announcement" })),
    ...notifications.map((n) => ({
      ...n,
      type: "dbNotification",
      title: n.description,
      date: n.created_at,
    })),
  ];

  // Apply filter
  const getFilteredNotifications = () => {
    return merged.filter((item) => {
      const isRead =
        item.type === "announcement" ? false : item.read_status === 1;

      if (filter === "read") return isRead;
      if (filter === "unread") return !isRead;
      return true;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "80px",
          right: "20px",
          width: 360,
          bgcolor: "#fff",
          boxShadow: 24,
          borderRadius: 2,
          p: 2,
          maxHeight: "80vh",
          overflowY: "auto",
          zIndex: 1500,
          border: "1px solid #ddd",
          "@media (max-width: 600px)": { width: "90vw", right: "5%" },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#8B2635" }}>
            Notifications
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter Buttons */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <ButtonGroup size="small" variant="outlined">
            {["all", "unread", "read"].map((f) => (
              <Button
                key={f}
                onClick={() => setFilter(f)}
                variant={filter === f ? "contained" : "outlined"}
                sx={{
                  bgcolor: filter === f ? "#8B2635" : "transparent",
                  color: filter === f ? "#fff" : "#8B2635",
                  borderColor: "#8B2635",
                  "&:hover": {
                    bgcolor:
                      filter === f
                        ? "#7a1f2d"
                        : "rgba(139, 38, 53, 0.1)",
                  },
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item, idx) => {
            const isRead =
              item.type === "announcement"
                ? false
                : item.read_status === 1;

            return (
              <Box
                key={`${item.type}-${item.id || idx}`}
                sx={{
                  mb: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isRead ? "#f8f8f8" : "#e3f2fd",
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "#f1f1f1" },
                }}
                onClick={() => handleNotificationClick(item)}
              >
                <Typography
                  fontWeight={isRead ? "normal" : "bold"}
                  fontSize="0.9rem"
                  sx={{ color: "#333" }}
                >
                  {item.title}
                </Typography>
                <Typography fontSize="0.75rem" sx={{ color: "#666" }}>
                  {item.date ? new Date(item.date).toLocaleString() : ""}
                </Typography>
              </Box>
            );
          })
        ) : (
          <Typography
            fontSize="0.85rem"
            sx={{ color: "#777", textAlign: "center" }}
          >
            {filter === "all"
              ? "No notifications at the moment."
              : `No ${filter} notifications.`}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default NotificationsModal;
