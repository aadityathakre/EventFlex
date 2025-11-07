import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, TextField, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import poolService from '../services/poolService';
import { format } from 'date-fns';

const PoolList = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: '',
    location: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadPools = async () => {
    try {
      setLoading(true);
      const response = await poolService.getAvailablePools({
        ...filters,
        page
      });
      setPools(response.pools);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, [page, filters]);

  const handleApply = (poolId) => {
    navigate(`/pools/${poolId}/apply`);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  if (loading && page === 1) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Filters */}
      <Box mb={3} display="flex" gap={2}>
        <TextField
          name="skills"
          label="Skills (comma separated)"
          value={filters.skills}
          onChange={handleFilterChange}
          size="small"
        />
        <TextField
          name="location"
          label="Location"
          value={filters.location}
          onChange={handleFilterChange}
          size="small"
        />
      </Box>

      {/* Pools Grid */}
      <Grid container spacing={3}>
        {pools.map((pool) => (
          <Grid item xs={12} md={6} lg={4} key={pool._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {pool.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {pool.description}
                </Typography>
                
                {/* Skills */}
                <Box mb={2}>
                  {pool.skillsRequired?.map((skill, index) => (
                    <Chip 
                      key={index}
                      label={skill}
                      size="small"
                      style={{ margin: '0 4px 4px 0' }}
                    />
                  ))}
                </Box>

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

                {/* Positions */}
                <Typography variant="body2" color="textSecondary">
                  Positions: {pool.filledPositions}/{pool.maxPositions}
                </Typography>

                {/* Deadline */}
                {pool.applicationDeadline && (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Apply by: {format(new Date(pool.applicationDeadline), 'PPP')}
                  </Typography>
                )}

                {/* Organizer */}
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Posted by: {pool.organizer.name}
                </Typography>

                {/* Apply Button */}
                <Box mt={2}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleApply(pool._id)}
                    disabled={pool.hasApplied}
                  >
                    {pool.hasApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box mt={3} display="flex" justifyContent="center" gap={2}>
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Typography>
            Page {page} of {totalPages}
          </Typography>
          <Button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PoolList;