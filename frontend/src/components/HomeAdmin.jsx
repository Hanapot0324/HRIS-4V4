// AdminHome.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Box,
  Grid,
  Typography,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Modal,
  Badge,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  AccountBalance,
  Description,
  Download,
  Person,
  AccessTime,
  KeyboardArrowDown,
  ArrowForwardIos,
} from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowBackIosNew';
import PeopleIcon from "@mui/icons-material/People";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import PaymentIcon from "@mui/icons-material/Payment";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsModal from "./NotificationsModal";



import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";


const STAT_CARDS = [
  { label: "Employees", valueKey: "employees", defaultValue: 654, icon: <PeopleIcon sx={{ fontSize: 40 }} /> },
  { label: "Today's Attendance", valueKey: "todayAttendance", defaultValue: 548, icon: <EventAvailableIcon sx={{ fontSize: 40}} /> },
  { label: "Leave Requests", valueKey: "leaveRequests", defaultValue: 93, icon: <BeachAccessIcon sx={{ fontSize: 40 }} /> },
  { label: "Pending Payroll", valueKey: "pendingPayroll", defaultValue: 386, icon: <PendingActionsIcon sx={{ fontSize: 40}} /> },
  { label: "Leave Pending", valueKey: "leavePending", defaultValue: 55, icon: <PendingActionsIcon sx={{ fontSize: 40}} /> },
  { label: "Processed Payroll", valueKey: "processedPayroll", defaultValue: 268, icon: <PaymentIcon sx={{ fontSize: 40}} /> },
  { label: "Leave Approved", valueKey: "leaveApproved", defaultValue: 38, icon: <CheckCircleIcon sx={{ fontSize: 40 }} /> },
  { label: "Payslip", valueKey: "payslip", defaultValue: 268, icon: <DescriptionIcon sx={{ fontSize: 40 }} /> },
];


const AdminHome = () => {
  const [username, setUsername] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [attendanceChartData, setAttendanceChartData] = useState([]);
  const [leaveTrackerData, setLeaveTrackerData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());


  const navigate = useNavigate();
  const month = calendarDate.getMonth();
  const year = calendarDate.getFullYear();


  // slideshow interval
  useEffect(() => {
    if (announcements.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements]);


  // decode token for basic info (if you store token in localStorage)
  const getUserInfo = () => {
    const token = localStorage.getItem("token");
    if (!token) return {};
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      return {
        role: decoded.role,
        employeeNumber: decoded.employeeNumber,
        username: decoded.username,
      };
    } catch (err) {
      return {};
    }
  };


  useEffect(() => {
    const u = getUserInfo();
    if (u.username) setUsername(u.username);
    if (u.employeeNumber) setEmployeeNumber(u.employeeNumber);
  }, []);


  // Fetch announcements and other admin data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Announcements
        const annRes = await axios.get("http://localhost:5000/api/announcements");
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);


        // Profile picture (personal info)
        const piRes = await axios.get("http://localhost:5000/personalinfo/person_table");
        const match = Array.isArray(piRes.data)
          ? piRes.data.find((p) => p.agencyEmployeeNum?.toString() === employeeNumber?.toString())
          : null;
        if (match && match.profile_picture) setProfilePicture(match.profile_picture);


        // Stats (example endpoint - adapt to your backend)
        // fallback to defaults if endpoints are missing
        try {
          const statsRes = await axios.get("http://localhost:5000/api/admin/stats");
          setStats(statsRes.data || {});
        } catch {
          // leave stats empty and rely on defaults defined in UI
          setStats({});
        }


        // Attendance summary for chart
        try {
          const attRes = await axios.get("http://localhost:5000/api/admin/attendance-summary");
          // expected shape: [{ name: 'Present', value: 500 }, ...] or adapt below if different
          if (Array.isArray(attRes.data) && attRes.data.length > 0) {
            setAttendanceChartData(
              attRes.data.map((r) => ({ name: r.name, value: r.value }))
            );
          } else {
            setAttendanceChartData([
              { name: "Present", value: 480 },
              { name: "Absent", value: 220 },
              { name: "Late", value: 95 },
            ]);
          }
        } catch {
          setAttendanceChartData([
            { name: "Present", value: 480 },
            { name: "Absent", value: 220 },
            { name: "Late", value: 95 },
          ]);
        }


        // Leave tracker
        try {
          const leaveRes = await axios.get("http://localhost:5000/api/admin/leave-tracker");
          if (Array.isArray(leaveRes.data) && leaveRes.data.length > 0) {
            setLeaveTrackerData(leaveRes.data.map((r) => ({ name: r.name, value: r.value })));
          } else {
            setLeaveTrackerData([
              { name: "Sick", value: 8 },
              { name: "Vacation", value: 12 },
              { name: "Bereavement", value: 16 },
              { name: "Maternity", value: 20 },
              { name: "Emergency", value: 12 },
            ]);
          }
        } catch {
          setLeaveTrackerData([
            { name: "Sick", value: 8 },
            { name: "Vacation", value: 12 },
            { name: "Bereavement", value: 16 },
            { name: "Maternity", value: 20 },
            { name: "Emergency", value: 12 },
          ]);
        }


        // Leave requests table
        try {
          const lrRes = await axios.get("http://localhost:5000/api/admin/leave-requests");
          setLeaveRequests(Array.isArray(lrRes.data) ? lrRes.data : []);
        } catch {
          // sample fallback
          setLeaveRequests([
            {
              employeeNumber: "#00000000",
              employeeName: "John Doe",
              leaveType: "Annual Leave",
              startDate: "14-06-2025",
              endDate: "15-07-2025",
              status: "Pending",
            },
            {
              employeeNumber: "#00000000",
              employeeName: "Anna Smith",
              leaveType: "Sick Leave",
              startDate: "21-02-2025",
              endDate: "22-02-2025",
              status: "Approved",
            },
            {
              employeeNumber: "#00000000",
              employeeName: "Juan Dela Cruz",
              leaveType: "Casual Leave",
              startDate: "31-12-2024",
              endDate: "02-01-2025",
              status: "Declined",
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };


    fetchAll();
  }, [employeeNumber]);


  const handleOpenModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAnnouncement(null);
  };


  const handlePrevSlide = () => {
    setCurrentSlide((s) => (s - 1 + announcements.length) % announcements.length);
  };
  const handleNextSlide = () => {
    setCurrentSlide((s) => (s + 1) % announcements.length);
  };


  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === 0) return "₱0.00";
    return `₱${parseFloat(value).toLocaleString()}`;
  };


  // calendar generator (Mon-first)
  const generateCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 Sun
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1; // shift to Mon-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < adjustedFirst; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    while (days.length < 42) days.push(null);
    return days;
  };


  const calendarDays = generateCalendar(month, year);


return (
  <Container maxWidth={false} sx={{ backgroundColor: "#f5f0e8", minHeight: "100%", p: 2, ml: 4, mt: -5 }}>
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Left/Main Column */}
      <Box sx={{ flex: 1, mr: 1 }}>
        {/* Row 1: Stats + Calendar */}
        <Grid container spacing={1} sx={{ mb: 5 }}>
          {/* Stats Cards - Left side */}
        <Grid item xs={12} md={4}>
            <Grid container spacing={5.5}>
                {STAT_CARDS.map((card) => (
                <Grid item xs={12} sm={6} md={6} key={card.label}>
                    <Paper
                    elevation={0}
                    sx={{
                        backgroundColor: "#fff", // white background
                        color: "#333",
                        borderRadius: 2,
                        border: "1px solid #6d2323", // burgundy border
                        p: 1.6,
                        height: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 1.5,
                        mr: "-15px",
                        mb: "-38px",
                    }}
                    >
                    {/* Small Icon on the left with white color */}
                    <Box
                        sx={{
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        }}
                    >
                        {React.cloneElement(card.icon, { fontSize: "14px", htmlColor: "#6d2323" })}
                    </Box>


                    {/* Number and Label */}
                    <Box>
                        <Typography fontSize="18px" fontWeight="bold" color="#333">
                        {stats[card.valueKey] !== undefined
                            ? stats[card.valueKey]
                            : card.defaultValue}
                        </Typography>
                        <Typography fontSize="12px" sx={{ opacity: 0.7 }}>
                        {card.label}
                        </Typography>
                    </Box>
                    </Paper>
                </Grid>
                ))}
            </Grid>
            </Grid>




            {/* slideshow */}
          <Grid item xs={12} md={8}>
            <Box
                sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid #8B2635",
                height: "370px",
                ml: 5,
                mb: -3,
                cursor: "pointer",
                }}
                onClick={() => {
                const announcement = announcements[currentSlide];
                if (announcement) {
                    setSelectedAnnouncement(announcement);
                    setOpenModal(true);
                }
                }}
            >
                {announcements.length > 0 && (
                <>
                    {/* Previous button */}
                    <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrevSlide();
                    }}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: 15,
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        zIndex: 2,
                    }}
                    >
                    <ArrowBackIosNewIcon />
                    </IconButton>


                    {/* Slide image */}
                    <Box
                    component="img"
                    src={
                        announcements[currentSlide]?.image
                        ? `http://localhost:5000${announcements[currentSlide].image}`
                        : "/api/placeholder/800/400"
                    }
                    alt={announcements[currentSlide]?.title || "Announcement"}
                    sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                    />


                    {/* Inner shadow overlay */}
                    <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        background:
                        "radial-gradient(circle at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)",
                    }}
                    />


                    {/* Next button */}
                    <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNextSlide();
                    }}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        right: 15,
                        transform: "translateY(-50%)",
                        backgroundColor: "rgba(255,255,255,0.9)",
                        zIndex: 2,
                    }}
                    >
                    <ArrowForwardIosIcon />
                    </IconButton>


                    {/* Caption box */}
                    <Box
                    sx={{
                        position: "absolute",
                        bottom: 20,
                        left: 20,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        backdropFilter: "blur(4px)",
                    }}
                    >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                        color: "white",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        }}
                    >
                        {announcements[currentSlide]?.title}
                    </Typography>
                    <Typography
                        fontSize="small"
                        sx={{
                        color: "white",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
                        }}
                    >
                        {new Date(announcements[currentSlide]?.date).toDateString()}
                    </Typography>
                    </Box>
                </>
                )}
            </Box>


            {/* Modal for full announcement details */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="announcement-modal"
                aria-describedby="announcement-details"
            >
                <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "80%",
                    maxWidth: 600,
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    maxHeight: "90vh",
                    overflow: "auto",
                }}
                >
                {selectedAnnouncement && (
                    <>
                    <Typography variant="h5" component="h2" gutterBottom>
                        {selectedAnnouncement.title}
                    </Typography>
                    {selectedAnnouncement.image && (
                        <Box
                        component="img"
                        src={`http://localhost:5000${selectedAnnouncement.image}`}
                        alt={selectedAnnouncement.title}
                        sx={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 300,
                            objectFit: "cover",
                            borderRadius: 1,
                            mb: 2,
                        }}
                        />
                    )}
                    <Typography variant="body1" paragraph>
                        {selectedAnnouncement.about}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Posted on: {new Date(selectedAnnouncement.date).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                        variant="contained"
                        onClick={handleCloseModal}
                        sx={{
                            mt: 2,
                            backgroundColor: "#700000",
                            "&:hover": { backgroundColor: "#500000" },
                        }}
                        >
                        Close
                        </Button>
                    </Box>
                    </>
                )}
                </Box>
            </Modal>
            </Grid>






                    </Grid>


                    <Grid container spacing={3} sx={{ mb: 2 }}>
            {/* Graph 1 - Left side */}
            <Grid item xs={12} md={4}>
                <Box
                sx={{
                    borderRadius: 2,
                    border: "1px solid #8B2635",
                    backgroundColor: "#fff6f5",
                    p: 2,
                    height: "200px",
                   
                }}
                >
                <Typography fontWeight="bold" sx={{ mb: 1, color: '#6d2323' }}>
                    Employee Attendance
                </Typography>
                <Box sx={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartTooltip />
                        <Bar dataKey="value">
                        {attendanceChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={["#6D1E29", "#8B2635", "#B23A3A"][idx % 3]} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </Box>
                </Box>
            </Grid>


            {/* Graph 2 - Middle */}
            <Grid item xs={12} md={4}>
                <Box
                sx={{
                    borderRadius: 2,
                    border: "1px solid #8B2635",
                    backgroundColor: "#fff6f5",
                    p: 2,
                    height: "200px",
                }}
                >
                <Typography fontWeight="bold" sx={{ mb: 1, color: "#6d2323" }}>
                    Employee Leave Tracker
                </Typography>
                <Box sx={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={leaveTrackerData}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <RechartTooltip />
                        <Bar dataKey="value" barSize={16}>
                        {leaveTrackerData.map((entry, idx) => (
                            <Cell key={`cellL-${idx}`} fill={["#6D1E29", "#8B2635", "#B23A3A", "#9C2C2C", "#4D1B1B"][idx % 5]} />
                        ))}
                        </Bar>
                    </BarChart>
                    </ResponsiveContainer>
                </Box>
                </Box>
            </Grid>


            {/* Announcements - Right side */}
            <Grid item xs={12} md={4}>
                  {/* Calendar - added below Admin Panel */}
            <Box
                sx={{
                border: "1px solid #8B2635",
                borderRadius: 2,
                overflow: "hidden",
                height: "100%",
                backgroundColor: "white",
                }}
            >
                <Box sx={{ backgroundColor: "#8B2635", p: 1.5, textAlign: "center" }}>
                <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                    {new Date(year, month).toLocaleString("default", { month: "long" })} {year}
                </Typography>
                </Box>
                <Box sx={{ p: 1 }}>
                <Grid container spacing={0}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <Grid item xs={12 / 7} key={day}>
                        <Typography
                        sx={{
                            textAlign: "center",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            color: "#8B2635",
                        }}
                        >
                        {day}
                        </Typography>
                    </Grid>
                    ))}
                </Grid>
                <Grid container spacing={0}>
                    {calendarDays.map((day, index) => (
                    <Grid item xs={12 / 7} key={index}>
                        <Box
                        sx={{
                            textAlign: "center",
                            p: 0.5,
                            fontSize: "0.8rem",
                            color: day ? "#333" : "transparent",
                        }}
                        >
                        {day || ""}
                        </Box>
                    </Grid>
                    ))}
                </Grid>
                </Box>
            </Box>
            </Grid>
            </Grid>




        {/* Row 3: Graph 2 + Announcements */}
        <Grid container spacing={2}>
         
        </Grid>
      </Box>


     {/* Right Sidebar */}
      <Box
        sx={{
          width: 320,
          backgroundColor: "#ffffff",
          border: "1px solid #8B2635",
          borderRadius: 2,
          p: 1.5,
          height: "fit-content",
          position: "sticky",
          top: 20,
          cursor: "pointer", // shows pointer on hover
          "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } // optional hover effect
        }}
        onClick={() => {
          // action when sidebar is clicked
          navigate("/profile"); // example: navigate to profile page
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mb: 2, gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton
                size="small"
                sx={{ color: "black" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifModalOpen(true);
                }}
              >
                <Badge badgeContent={announcements.length} color="error">
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Notifications Modal */}
            <NotificationsModal
              open={notifModalOpen}
              onClose={() => setNotifModalOpen(false)}
              announcements={announcements}
              setSelectedAnnouncement={setSelectedAnnouncement}
              setOpenModal={setOpenModal}
            />

            <Tooltip title="More Options">
              <IconButton size="small" sx={{ color: "black" }} onClick={(e) => e.stopPropagation()}>
                <ArrowDropDownIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>


          <Avatar
            alt={username}
            src={profilePicture ? `http://localhost:5000${profilePicture}` : undefined}
            sx={{
              width: 80,
              height: 80,
              border: "3px solid #8B2635",
              mb: 1,
            }}
          />
          <Typography variant="h6" fontWeight="bold" sx={{ color: "black", textAlign: "center" }}>
            {username || "Admin Name"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", textAlign: "center" }}>
            {employeeNumber || "#00000000"}
          </Typography>
        </Box>


        {/* Quick Links */}
        <Box sx={{ border: '1px solid #8B2635', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: '#6d2323',
              p: 1,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
              QUICK LINKS
            </Typography>
          </Box>


          {/* Grid of Cards */}
          <Grid container spacing={0} sx={{ p: 1 }}>
            {/* DTR */}
            <Grid item xs={3}>
              <Link to="/daily_time_record" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    m: 0.5,
                    p: 1,
                    backgroundColor: '#6d2323',
                    color: '#fff',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 50,
                    textAlign: 'center',
                  }}
                >
                  <AccessTime sx={{ fontSize: 30 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                    View DTR
                  </Typography>
                </Box>
              </Link>
            </Grid>


            {/* PDS */}
            <Grid item xs={3}>
              <Link to="/pds1" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    m: 0.5,
                    p: 1,
                    backgroundColor: '#6d2323',
                    color: '#fff',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 50,
                    textAlign: 'center',
                  }}
                >
                  <Person sx={{ fontSize: 30 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                    View PDS
                  </Typography>
                </Box>
              </Link>
            </Grid>


            {/* Payslip */}
            <Grid item xs={3}>
              <Link to="/payslip" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    m: 0.5,
                    p: 1,
                    backgroundColor: '#6d2323',
                    color: '#fff',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 50,
                    textAlign: 'center',
                  }}
                >
                  <Download sx={{ fontSize: 30 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Download Payslip
                  </Typography>
                </Box>
              </Link>
            </Grid>


            {/* Request Leave */}
            <Grid item xs={3}>
              <Link to="/leave-request" style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    m: 0.5,
                    p: 1,
                    backgroundColor: '#6d2323',
                    color: '#fff',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 50,
                    textAlign: 'center',
                  }}
                >
                  <Description sx={{ fontSize: 30 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Request Leave
                  </Typography>
                </Box>
              </Link>
            </Grid>
          </Grid>
        </Box>


         {/* Admin Panel */}
            <Card sx={{ border: "1px solid #6d2323", borderRadius: 2, mt: 1.5, mb: 2 }}>
            <Box
                sx={{
                backgroundColor: "#6d2323",
                p: 1,
                textAlign: "center",
                }}
            >
                <Typography sx={{ color: "#fff", fontWeight: "bold", fontSize: "0.9rem" }}>
                ADMIN PANEL
                </Typography>
            </Box>
            <CardContent>
                <Grid container spacing={1}>
                {[
                    "Registration",
                    "Announcement",
                    "Leaves",
                    "Payroll",
                    "DTRs",
                    "Audit",
                ].map((btn, i) => {
                    let link = null;
                    if (btn === "Registration") link = "/registration";
                    if (btn === "Announcement") link = "/announcement";
                    if (btn === "Leaves") link = "/leave-request";
                    if (btn === "Payroll") link = "/payroll-table";
                    if (btn === "DTRs") link = "/daily_time_record_faculty";
                    if (btn === "Audit") link = "/audit-logs";


                    return (
                    <Grid item xs={6} key={i}>
                        {link ? (
                        <Button
                            fullWidth
                            variant="contained"
                            component={Link}
                            to={link}
                            sx={{
                            backgroundColor: "#6d2323",
                            color: "#fff",
                            '&:hover': {
                                backgroundColor: "#5c1d1d",
                            },
                            }}
                        >
                            {btn}
                        </Button>
                        ) : (
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                            backgroundColor: "#6d2323",
                            color: "#fff",
                            '&:hover': {
                                backgroundColor: "#5c1d1d",
                            },
                            }}
                        >
                            {btn}
                        </Button>
                        )}
                    </Grid>
                    );
                })}
                </Grid>
            </CardContent>
            </Card>
                




        </Box>
    </Box>



  </Container>
);
};


export default AdminHome;


 
