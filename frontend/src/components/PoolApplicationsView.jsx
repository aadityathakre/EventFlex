import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import { useParams } from 'react-router-dom';
import poolService from '../services/poolService';
import { format } from 'date-fns';
import notificationService from '../services/notificationService';

const PoolApplicationsView = () => {
  const { poolId } = useParams();
  const [pool, setPool] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [feedbackDialog, setFeedbackDialog] = useState({
    open: false,
    applicationId: null,
    status: null,
    feedback: ''
  });

  const loadData = async () => {
    try {
      const [poolData, applicationsData] = await Promise.all([
        poolService.getPoolDetails(poolId),
        poolService.getPoolApplications(poolId)
      ]);
      setPool(poolData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [poolId]);

  // Subscribe to real-time application events so organizer UI updates immediately
  useEffect(() => {
    const unsubAppCreated = notificationService.on('pool_application_created', (data) => {
      if (data.poolId === poolId) loadData();
    });

    const unsubDecided = notificationService.on('application_decided_org', (application) => {
      if (application.pool && application.pool._id === poolId) loadData();
    });

    return () => {
      unsubAppCreated();
      unsubDecided();
    };
  }, [poolId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openFeedbackDialog = (applicationId, status) => {
    setFeedbackDialog({
      open: true,
      applicationId,
      status,
      feedback: ''
    });
  };

  const closeFeedbackDialog = () => {
    setFeedbackDialog({
      open: false,
      applicationId: null,
      status: null,
      feedback: ''
    });
  };

  const handleDecision = async () => {
    try {
      await poolService.decideOnApplication(
        feedbackDialog.applicationId,
        {
          status: feedbackDialog.status,
          feedback: feedbackDialog.feedback
        }
      );
      await loadData(); // Reload data to reflect changes
      closeFeedbackDialog();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (tabValue === 0) return app.status === 'pending';
    if (tabValue === 1) return app.status === 'selected';
    if (tabValue === 2) return app.status === 'rejected';
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Pool Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {pool?.name}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" paragraph>
              {pool?.description}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Positions: {pool?.filledPositions}/{pool?.maxPositions}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Applications: {applications.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Pending (${applications.filter(a => a.status === 'pending').length})`} />
          <Tab label={`Selected (${applications.filter(a => a.status === 'selected').length})`} />
          <Tab label={`Rejected (${applications.filter(a => a.status === 'rejected').length})`} />
        </Tabs>
      </Box>

      {/* Applications List */}
      <Grid container spacing={3}>
        {filteredApplications.map((application) => (
          <Grid item xs={12} key={application._id}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Applicant Info */}
                <Grid item xs={12} sm={3}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={application.gig.avatar || application.gig.profileImage} />
                    <Box>
                      <Typography variant="subtitle1">
                        {application.gig.first_name ? `${application.gig.first_name} ${application.gig.last_name || ''}` : application.gig.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Applied: {format(new Date(application.createdAt), 'PPP')}
                      </Typography>
                      {application.gig.reputation && (
                        <Typography variant="body2" color="textSecondary">
                          Rating: {application.gig.reputation.overall_rating ? application.gig.reputation.overall_rating.toString() : application.gig.reputation.overall_rating} • {application.gig.reputation.trust_level}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                {/* Application Details */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cover Letter
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {application.coverLetter}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Skills
                  </Typography>
                  <Box mb={2}>
                    {application.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        style={{ margin: '0 4px 4px 0' }}
                      />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Relevant Experience
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {application.relevantExperience}
                  </Typography>
                </Grid>

                {/* Applicant Skills (from user profile) */}
                <Grid item xs={12}>
                  {application.gig.skills && application.gig.skills.length > 0 && (
                    <Box mb={2}>
                      <Typography variant="subtitle2">Profile Skills</Typography>
                      <Box>
                        {application.gig.skills.map((s, idx) => (
                          <Chip key={idx} label={`${s.name} (${s.proficiency})`} size="small" style={{ margin: '0 4px 4px 0' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {application.gig.profile?.bio && (
                    <>
                      <Typography variant="subtitle2">Bio</Typography>
                      <Typography variant="body2" paragraph>{application.gig.profile.bio}</Typography>
                    </>
                  )}
                </Grid>

                {/* Actions */}
                <Grid item xs={12} sm={3}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Typography variant="subtitle2">
                      Proposed Rate: ${application.proposedRate}
                    </Typography>

                    {application.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => openFeedbackDialog(application._id, 'selected')}
                        >
                          Select
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => openFeedbackDialog(application._id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {application.status !== 'pending' && (
                      <Chip
                        label={application.status}
                        color={application.status === 'selected' ? 'success' : 'error'}
                      />
                    )}

                    {application.organizerFeedback && (
                      <Typography variant="body2" color="textSecondary">
                        Feedback: {application.organizerFeedback}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog.open} onClose={closeFeedbackDialog}>
        <DialogTitle>
          {feedbackDialog.status === 'selected' ? 'Select Applicant' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Feedback"
            fullWidth
            multiline
            rows={4}
            value={feedbackDialog.feedback}
            onChange={(e) => setFeedbackDialog(prev => ({
              ...prev,
              feedback: e.target.value
            }))}
            helperText="Provide feedback for the applicant"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFeedbackDialog}>Cancel</Button>
          <Button onClick={handleDecision} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PoolApplicationsView;