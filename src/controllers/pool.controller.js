import Pool from '../models/Pool.model.js';
import PoolApplication from '../models/PoolApplication.model.js';
import ReputationScore from '../models/ReputationScore.model.js';
import UserSkill from '../models/UserSkill.model.js';
import UserProfile from '../models/UserProfile.model.js';
import { createNotification } from '../services/notification.service.js';
import { emitPoolEvent } from '../services/socket.service.js';

// List available pools for gigs (with paging & basic filters)
export const listAvailablePools = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      skills,
      location
    } = req.query;

    const query = {
      status: 'open'
    };

    if (skills) {
      const skillsList = skills.split(',').map(s => s.trim());
      query.skillsRequired = { $in: skillsList };
    }

    if (location) {
      query['venue.address'] = { $regex: location, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const pools = await Pool.find(query)
      .populate('organizer', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Pool.countDocuments(query);

    return res.status(200).json({
      pools,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (err) {
    console.error('listAvailablePools error', err);
    return res.status(500).json({ message: err.message });
  }
};

// Get specific pool details
export const getPoolDetails = async (req, res) => {
  try {
    const pool = await Pool.findById(req.params.id)
      .populate('organizer', 'name email profileImage')
      .populate('gigs.gig', 'name email profileImage');

    if (!pool) return res.status(404).json({ message: 'Pool not found' });

    // Check if current user has applied
    const application = await PoolApplication.findOne({ pool: pool._id, gig: req.user._id });

    return res.status(200).json({
      ...pool.toObject(),
      hasApplied: !!application,
      applicationStatus: application?.status
    });
  } catch (err) {
    console.error('getPoolDetails error', err);
    return res.status(500).json({ message: err.message });
  }
};

// Apply to a pool
export const applyToPool = async (req, res) => {
  try {
    const { coverLetter, proposedRate, skills, relevantExperience } = req.body;
    const poolId = req.params.id;

    const pool = await Pool.findById(poolId);
    if (!pool) return res.status(404).json({ message: 'Pool not found' });
    if (pool.status !== 'open') return res.status(400).json({ message: 'This pool is not accepting applications' });

    const existing = await PoolApplication.findOne({ pool: poolId, gig: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already applied to this pool' });

    const application = await PoolApplication.create({
      pool: poolId,
      gig: req.user._id,
      coverLetter,
      proposedRate,
      skills,
      relevantExperience
    });

    // Ensure pool.gigs contains an entry for this applicant (pending)
    try {
      const poolDoc = await Pool.findById(poolId);
      if (poolDoc) {
        const existing = poolDoc.gigs.find(g => String(g.gig) === String(req.user._id));
        if (!existing) {
          poolDoc.gigs.push({
            gig: req.user._id,
            status: 'pending',
            appliedAt: application.createdAt
          });
          await poolDoc.save();
        } else {
          // update appliedAt if needed
          existing.status = 'pending';
          existing.appliedAt = application.createdAt;
          await poolDoc.save();
        }
      }
    } catch (err) {
      console.warn('Failed to sync Pool.gigs with application:', err.message);
    }

    // Notify organizer
    await createNotification({
      recipient: pool.organizer,
      type: 'NEW_POOL_APPLICATION',
      message: `New application received for pool: ${pool.name}`,
      reference: { type: 'pool_application', id: application._id }
    });

    // Emit events so UI can update
    try {
      emitPoolEvent('pool_application_created', { poolId: pool._id, applicationId: application._id });
      const updatedPool = await Pool.findById(pool._id).populate('organizer', 'name email profileImage');
      emitPoolEvent('pool_updated', updatedPool);
    } catch (emitErr) {
      console.warn('Socket emit failed (applyToPool):', emitErr.message);
    }

    return res.status(201).json(application);
  } catch (err) {
    console.error('applyToPool error', err);
    return res.status(500).json({ message: err.message });
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

    let applications = await PoolApplication.find({ pool: pool._id })
      .populate('gig', 'first_name last_name email avatar')
      .sort({ createdAt: -1 })
      .lean();

    // For each application, append reputation, skills, and profile info
    applications = await Promise.all(applications.map(async (app) => {
      try {
        const rep = await ReputationScore.findOne({ user: app.gig._id }).lean();
        const skills = await UserSkill.find({ user: app.gig._id }).populate('skill', 'name').lean();
        const profile = await UserProfile.findOne({ user: app.gig._id }).lean();

        return {
          ...app,
          gig: {
            ...app.gig,
            reputation: rep ? { overall_rating: rep.overall_rating?.toString?.() || rep.overall_rating, trust_level: rep.trust_level } : null,
            skills: skills ? skills.map(s => ({ name: s.skill?.name || s.skill, proficiency: s.proficiency_level, verified: s.is_verified })) : [],
            profile: profile || null
          }
        };
      } catch (err) {
        console.warn('Failed to append extra profile info for application', app._id, err.message);
        return app;
      }
    }));

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

    // Emit socket events so organizer/gig UIs refresh in real-time
    try {
      emitPoolEvent('application_decided_org', application);
      const updatedPool = await Pool.findById(application.pool._id).populate('organizer', 'name email profileImage');
      emitPoolEvent('pool_updated', updatedPool);
    } catch (emitErr) {
      console.warn('Socket emit failed (decideOnApplication):', emitErr.message);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};