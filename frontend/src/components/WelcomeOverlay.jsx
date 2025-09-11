// WelcomeOverlay.jsx
import React from "react";
import { Box, Typography } from "@mui/material";
import logo from "../assets/logo.PNG";

const WelcomeOverlay = ({ open, username, employeeNumber }) => {
  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "#FFF8E1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
      }}
    >
      {/* Logo */}
      <Box
        component="img"
        src={logo}
        alt="Logo"
        sx={{
          width: 150,
          height: 150,
          borderRadius: "50%",
          mb: 3,
          boxShadow: "0 0 25px rgba(163, 29, 29, 0.5)",
          animation: "popIn 1s ease-out",
        }}
      />

      {/* Welcome text */}
      <Typography
        variant="h2"
        sx={{
          fontWeight: "bold",
          color: "#A31D1D",
          textAlign: "center",
          animation: "fadeInUp 1s ease-out",
        }}
      >
        Welcome, {username || "User"} 
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 1,
          color: "#333",
          animation: "fadeInUp 1.2s ease-out",
        }}
      >
        Employee No: {employeeNumber || "----"}
      </Typography>

      {/* Animations */}
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }

          @keyframes fadeInUp {
            0% { transform: translateY(20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default WelcomeOverlay;
