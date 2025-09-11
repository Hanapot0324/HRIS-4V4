import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Modal,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
} from "@mui/icons-material";

import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfullOverlay';

const DepartmentTable = () => {
  const [data, setData] = useState([]);
  const [newDepartment, setNewDepartment] = useState({
    code: '',
    description: '',
  });
  const [editDepartment, setEditDepartment] = useState(null);
  const [originalDepartment, setOriginalDepartment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/department-table');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/department-table', newDepartment);
      setNewDepartment({ code: '', description: '' });
      setTimeout(() => {
        setLoading(false);
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchDepartments();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/department-table/${editDepartment.id}`, editDepartment);
      setEditDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchDepartments();
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/department-table/${id}`);
      setEditDepartment(null);
      setOriginalDepartment(null);
      setIsEditing(false);
      fetchDepartments();
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditDepartment({ ...editDepartment, [field]: value });
    } else {
      setNewDepartment({ ...newDepartment, [field]: value });
    }
  };

  const handleOpenModal = (department) => {
    setEditDepartment({ ...department });
    setOriginalDepartment({ ...department });
    setIsEditing(false);
  };

  const handleStartEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setEditDepartment({ ...originalDepartment });
    setIsEditing(false);
  };
  const handleCloseModal = () => {
    setEditDepartment(null);
    setOriginalDepartment(null);
    setIsEditing(false);
  };

  const inputStyle = { marginRight: 10, marginBottom: 10, width: 300.25 };

  const filteredData = data.filter((department) => {
    const code = department.code?.toLowerCase() || "";
    const description = department.description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return code.includes(search) || description.includes(search);
  });

  return (
    <Container sx={{ mt: 0, width: '95%', display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Adding department record..." />

      {/* Success Overlay */}
      <SuccessfullOverlay open={successOpen} action={successAction} />

      {/* Department Information */}
      <Box sx={{ width: "100%", maxWidth: "900px", mb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "#6D2323",
            color: "#ffffff",
            p: 2,
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            pb: '15px'
          }}
        >
          <BusinessIcon sx={{ fontSize: "3rem", mr: 2, mt: "5px", ml: "5px" }} />
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Department Information
            </Typography>
            <Typography variant="body2">
              Insert Your Department Information
            </Typography>
          </Box>
        </Box>

        {/* Content/Form */}
        <Container
          sx={{
            backgroundColor: "#fff",
            p: 3,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            border: "1px solid #6d2323",
            width: "100%"
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                Department Code
              </Typography>
              <TextField
                value={newDepartment.code}
                onChange={(e) => handleChange("code", e.target.value)}
                fullWidth
                style={inputStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                Department Description
              </Typography>
              <TextField
                value={newDepartment.description}
                onChange={(e) => handleChange("description", e.target.value)}
                fullWidth
                style={inputStyle}
              />
            </Grid>
          </Grid>

          <Button
            onClick={handleAdd}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              mt: 3,
              width: "100%",
              backgroundColor: "#6D2323",
              color: "#FEF9E1",
              "&:hover": { backgroundColor: "#5a1d1d" },
            }}
          >
            Add
          </Button>
        </Container>
      </Box>

      {/* Department Records */}
      <Box sx={{ width: "100%", maxWidth: "900px" }}>
        {/* Header */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            color: "#6d2323",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            alignItems: "center",
            pb: "15px",
            pt: '15px',
            border: '1px solid #6d2323',
            borderBottom: 'none',
            width: "99.7%",
          }}
        >
          <ReorderIcon sx={{ fontSize: "3rem", mr: 2, mt: "5px", ml: "25px" }} />
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Department Records
            </Typography>
            <Typography variant="body2">
              View and manage department information
            </Typography>
          </Box>
        </Box>

        {/* Content */}
        <Container
          sx={{
            backgroundColor: "#fff",
            p: 3,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            border: "1px solid #6d2323",
            width: "100%"
          }}
        >
          {/* Search Section */}
          <Box sx={{ mb: 3, width: "100%" }}>
            <Typography variant="subtitle2" sx={{ color: "#6D2323", mb: 1 }}>
              Search Records using Department Code or Description
            </Typography>
            <Box display="flex" alignItems="center" width="100%">
              <TextField
                size="small"
                variant="outlined"
                placeholder="Search by Code or Description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: "white",
                  borderRadius: 1,
                  width: "100%",
                  maxWidth: "800px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#6D2323" },
                    "&:hover fieldset": { borderColor: "#6D2323" },
                    "&.Mui-focused fieldset": { borderColor: "#6D2323" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "#6D2323", marginRight: 1 }} />
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Records / No Records */}
          {filteredData.length > 0 ? (
            <Grid container spacing={2} sx={{ minHeight: "200px" }}>
              {filteredData.map((department) => (
                <Grid item xs={12} sm={6} md={4} key={department.id}>
                  <Box
                    onClick={() => handleOpenModal(department)}
                    sx={{
                      border: "1px solid #6d2323",
                      borderRadius: 2,
                      p: 2,
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" },
                      height: "80%",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "black", mb: 1 }}>
                      Department Code:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#6d2323", mb: 1 }}>
                      {department.code}
                    </Typography>
                    <Chip
                      label={department.description}
                      sx={{
                        backgroundColor: "#6d2323",
                        color: "#fff",
                        borderRadius: "50px",
                        px: 2,
                        fontWeight: "bold",
                        maxWidth: "100%",
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", mt: 3, minHeight: "200px" }}>
              <Typography variant="body1" sx={{ color: "#6D2323", fontWeight: "bold" }}>
                No Records Found
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* Modal */}
      <Modal
        open={!!editDepartment}
        onClose={handleCloseModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #6d2323",
            borderRadius: 2,
            width: "100%",
            maxWidth: "600px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {editDepartment && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  backgroundColor: "#6D2323",
                  color: "#ffffff",
                  p: 2,
                  borderRadius: "8px 8px 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">
                  {isEditing ? "Edit Department Information" : "Department Information"}
                </Typography>
                <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
                  <Close />
                </IconButton>
              </Box>

              {/* Modal Content */}
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Department Code
                    </Typography>
                    <TextField
                      value={editDepartment.code}
                      onChange={(e) => setEditDepartment({ ...editDepartment, code: e.target.value })}
                      fullWidth
                      disabled={!isEditing}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "#000000",
                          color: "#000000"
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Department Description
                    </Typography>
                    <TextField
                      value={editDepartment.description}
                      onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                      fullWidth
                      disabled={!isEditing}
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "#000000",
                          color: "#000000"
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => handleDelete(editDepartment.id)}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        sx={{ color: "#ffffff", backgroundColor: 'black' }}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={handleStartEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{ backgroundColor: "#6D2323", color: "#FEF9E1" }}
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{ color: "#ffffff", backgroundColor: 'black' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{ backgroundColor: "#6D2323", color: "#FEF9E1" }}
                      >
                        Save
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default DepartmentTable;
