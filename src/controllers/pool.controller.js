import Pool from '../models/Pool.model.js';
import PoolApplication from '../models/PoolApplication.model.js';
import { createNotification } from '../services/notification.service.js';

// List all available pools for gigs
export const listAvailablePools = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10,
      skills,
      location 
    } = req.query;

    const query = {
      status: 'open',
      applicationDeadline: { $gt: new Date() }
    };

    // Filter by skills if provided
    if (skills) {
      const skillsList = skills.split(',').map(s => s.trim());
      query.skillsRequired = { $in: skillsList };
    }

    // Filter by location if provided
    if (location) {
      // Implement location-based filtering using coordinates
      // This is a simplified version - you might want to use geospatial queries
      query['venue.address'] = { $regex: location, $options: 'i' };
    }

    const pools = await Pool.find(query)
      .populate('organizer', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Pool.countDocuments(query);

    res.json({
      pools,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific pool details
export const getPoolDetails = async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('organizer', 'name email profileImage')
      .populate('gigs.gig', 'name email profileImage');
    
    if (!pool) {
      return res.status(404).json({ message: 'Pool not found' });
    }

    // Check if current user has applied
    const application = await PoolApplication.findOne({
      pool: pool._id,
      gig: req.user._id
    });

    res.json({
      ...pool.toJSON(),
      hasApplied: !!application,
      applicationStatus: application?.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to a pool
export const applyToPool = async (req, res) => {
  try {
    const { coverLetter, proposedRate, skills, relevantExperience } = req.body;
    const poolId = req.params.id;

    // Check if pool exists and is open
    const pool = await Pool.findById(poolId);
    if (!pool) {
      return res.status(404).json({ message: 'Pool not found' });
    }
    if (pool.status !== 'open') {
      return res.status(400).json({ message: 'This pool is not accepting applications' });
    }

    // Check if already applied
    const existingApplication = await PoolApplication.findOne({
      pool: poolId,
      gig: req.user._id
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this pool' });
    }

    const application = new PoolApplication({
      pool: poolId,
      gig: req.user._id,
      coverLetter,
      proposedRate,
      skills,
      relevantExperience
    });

    await application.save();

    // Notify organizer of new application
    await createNotification({
      recipient: pool.organizer,
      type: 'NEW_POOL_APPLICATION',
      message: `New application received for pool: ${pool.name}`,
      reference: {
        type: 'pool_application',
        id: application._id
      }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get gig's applications
export const getMyApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { gig: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const applications = await PoolApplication.find(query)
      .populate('pool')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new pool (organizer only)
export const createPool = async (req, res) => {
  try {
    const {
      name,
      description,
      requirements,
      skillsRequired,
      date,
      venue,
      maxPositions,
      applicationDeadline
    } = req.body;

    const pool = new Pool({
      organizer: req.user._id,
      name,
      description,
      requirements,
      skillsRequired,
      date,
      venue,
      maxPositions,
      applicationDeadline
    });

    await pool.save();
    res.status(201).json(pool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update pool (organizer only)
export const updatePool = async (req, res) => {
  try {
    const pool = await Pool.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!pool) {
      return res.status(404).json({ message: 'Pool not found' });
    }

    Object.assign(pool, req.body);
    await pool.save();
    res.json(pool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get organizer's pools
export const getMyPools = async (req, res) => {
  try {
    const pools = await Pool.find({ organizer: req.user._id })
      .populate('gigs.gig', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(pools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications for a specific pool (organizer only)
export const getPoolApplications = async (req, res) => {
  try {
    const pool = await Pool.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });

    if (!pool) {
      return res.status(404).json({ message: 'Pool not found' });
    }

    const applications = await PoolApplication.find({ pool: pool._id })
      .populate('gig', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decide on an application (select/reject)
export const decideOnApplication = async (req, res) => {
  try {
    const { status, feedback } = req.body;
    const applicationId = req.params.id;

    const application = await PoolApplication.findById(applicationId)
      .populate('pool')
      .populate('gig', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify organizer owns the pool
    if (application.pool.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    application.organizerFeedback = feedback;
    application.organizerActionDate = new Date();
    await application.save();

    // Create notification for gig
    await createNotification({
      recipient: application.gig._id,
      type: `POOL_APPLICATION_${status.toUpperCase()}`,
      message: `Your application for "${application.pool.name}" has been ${status}`,
      reference: {
        type: 'pool_application',
        id: application._id
      }
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};