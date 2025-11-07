import React from 'react';
import { Box, Typography } from '@mui/material';
import PoolList from '../../components/PoolList';

const GigPools = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, px: 3, pt: 3 }}>
        Available Event Pools
      </Typography>
      <PoolList />
    </Box>
  );
};

export default GigPools;