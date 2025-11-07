import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validateRole } from '../middlewares/roleValidation.middleware.js';
import * as poolController from '../controllers/pool.controller.js';

const router = express.Router();

// Public routes (requires auth but no specific role)
router.get('/pools', authMiddleware, poolController.listAvailablePools);
router.get('/pools/:id', authMiddleware, poolController.getPoolDetails);

// Gig routes
router.post('/pools/:id/apply', 
  authMiddleware, 
  validateRole(['gig']), 
  poolController.applyToPool
);
router.get('/applications', 
  authMiddleware, 
  validateRole(['gig']), 
  poolController.getMyApplications
);

// Organizer routes
router.post('/pools', 
  authMiddleware, 
  validateRole(['organizer']), 
  poolController.createPool
);
router.put('/pools/:id', 
  authMiddleware, 
  validateRole(['organizer']), 
  poolController.updatePool
);
router.get('/my-pools', 
  authMiddleware, 
  validateRole(['organizer']), 
  poolController.getMyPools
);
router.get('/pools/:id/applications', 
  authMiddleware, 
  validateRole(['organizer']), 
  poolController.getPoolApplications
);
router.put('/applications/:id/decide', 
  authMiddleware, 
  validateRole(['organizer']), 
  poolController.decideOnApplication
);

export default router;