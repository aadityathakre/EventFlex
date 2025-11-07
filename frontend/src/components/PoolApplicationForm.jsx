import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import poolService from '../services/poolService';
import { format } from 'date-fns';

const PoolApplicationForm = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: '',
    skills: '',
    relevantExperience: ''
  });

  useEffect(() => {
    const loadPoolDetails = async () => {
      try {
        const data = await poolService.getPoolDetails(poolId);
        setPool(data);
        if (data.hasApplied) {
          navigate('/my-applications');
        }
      } catch (err) {
        setError('Failed to load pool details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPoolDetails();
  }, [poolId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()),
        proposedRate: parseFloat(formData.proposedRate)
      };

      await poolService.applyToPool(poolId, applicationData);
      navigate('/my-applications');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!pool) {
    return (
      <Box p={3}>
        <Alert severity="error">Pool not found</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3}>
        <Box p={3}>
          <Typography variant="h5" gutterBottom>
            Apply to: {pool.name}
          </Typography>

          {/* Pool Details */}
          <Box mb={4}>
            <Typography variant="body1" paragraph>
              {pool.description}
            </Typography>

            <Grid container spacing={2}>
              {pool.date && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Event Date: {format(new Date(pool.date), 'PPP')}
                  </Typography>
                </Grid>
              )}
              
              {pool.venue?.address && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Venue: {pool.venue.address}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Required Skills:
                </Typography>
                <Box mt={1}>
                  {pool.skillsRequired?.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      style={{ margin: '0 4px 4px 0' }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Application Form */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Cover Letter"
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  required
                  helperText="Introduce yourself and explain why you're a good fit"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Proposed Rate (per hour)"
                  name="proposedRate"
                  type="number"
                  value={formData.proposedRate}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Relevant Skills (comma separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  helperText="Match your skills with the requirements"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Relevant Experience"
                  name="relevantExperience"
                  value={formData.relevantExperience}
                  onChange={handleChange}
                  required
                  helperText="Describe your relevant experience for this role"
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                  >
                    {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default PoolApplicationForm;