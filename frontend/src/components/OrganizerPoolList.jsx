import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import poolService from '../services/poolService';
import { format } from 'date-fns';

const OrganizerPoolList = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);

  const loadPools = async () => {
    try {
      setLoading(true);
      const data = await poolService.getMyPools();
      setPools(data);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, []);

  const handleMenuOpen = (event, pool) => {
    setMenuAnchor(event.currentTarget);
    setSelectedPool(pool);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPool(null);
  };

  const handleViewApplications = () => {
    navigate(`/organizer/pools/${selectedPool._id}/applications`);
    handleMenuClose();
  };

  const handleEditPool = () => {
    navigate(`/organizer/pools/${selectedPool._id}/edit`);
    handleMenuClose();
  };

  const handlePoolStatusChange = async (status) => {
    try {
      await poolService.updatePool(selectedPool._id, { status });
      loadPools();
    } catch (error) {
      console.error('Error updating pool status:', error);
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">My Event Pools</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/organizer/pools/create')}
        >
          Create New Pool
        </Button>
      </Box>

      <Grid container spacing={3}>
        {pools.map((pool) => (
          <Grid item xs={12} md={6} lg={4} key={pool._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" gutterBottom>
                    {pool.name}
                  </Typography>
                  <IconButton onClick={(e) => handleMenuOpen(e, pool)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {pool.description}
                </Typography>

                {/* Pool Status */}
                <Chip
                  label={pool.status}
                  color={
                    pool.status === 'open' ? 'success' :
                    pool.status === 'closed' ? 'error' :
                    'default'
                  }
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Event Details */}
                {pool.date && (
                  <Typography variant="body2" color="textSecondary">
                    Date: {format(new Date(pool.date), 'PPP')}
                  </Typography>
                )}
                {pool.venue?.address && (
                  <Typography variant="body2" color="textSecondary">
                    Venue: {pool.venue.address}
                  </Typography>
                )}

                {/* Required Skills */}
                <Box my={1}>
                  {pool.skillsRequired?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      style={{ margin: '0 4px 4px 0' }}
                    />
                  ))}
                </Box>

                {/* Applications Status */}
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Positions: {pool.filledPositions}/{pool.maxPositions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Applications: {pool.gigs.length}
                  </Typography>
                </Box>
                {/* Roles */}
                {pool.roles && pool.roles.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Roles & Slots</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      {pool.roles.map((r, idx) => (
                        <Chip key={idx} label={`${r.title}: ${r.filledCount || 0}/${r.requiredCount}`} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Quick Action Buttons */}
                <Box mt={2} display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/organizer/pools/${pool._id}/applications`)}
                  >
                    View Applications
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pool Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewApplications}>
          View Applications
        </MenuItem>
        <MenuItem onClick={handleEditPool}>
          Edit Pool
        </MenuItem>
        {selectedPool?.status === 'open' && (
          <MenuItem onClick={() => handlePoolStatusChange('closed')}>
            Close Pool
          </MenuItem>
        )}
        {selectedPool?.status === 'closed' && (
          <MenuItem onClick={() => handlePoolStatusChange('open')}>
            Reopen Pool
          </MenuItem>
        )}
        <MenuItem onClick={() => handlePoolStatusChange('archived')}>
          Archive Pool
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrganizerPoolList;