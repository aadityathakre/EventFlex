import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Pool from "../models/Pool.model.js";

export const updateAllEventStatuses = async () => {
  const now = new Date();

  try {
    // 1. Publish -> In Progress
    // Only affects Event status
    const startResult = await Event.updateMany(
      {
        status: "published",
        start_date: { $lte: now },
        end_date: { $gt: now }
      },
      { $set: { status: "in_progress" } }
    );
    
    if (startResult.modifiedCount > 0) {
        console.log(`[Auto-Update] Moved ${startResult.modifiedCount} events to 'in_progress'.`);
    }

    // 2. Published/In Progress -> Completed
    // Affects Event, OrganizerPool, Pool
    const eventsToComplete = await Event.find({
        status: { $in: ["published", "in_progress"] },
        end_date: { $lte: now }
    }).select("_id");

    if (eventsToComplete.length > 0) {
        const ids = eventsToComplete.map(e => e._id);
        
        // Update Events
        await Event.updateMany(
            { _id: { $in: ids } },
            { $set: { status: "completed" } }
        );

        // Update Organizer Pools
        await OrganizerPool.updateMany(
            { event: { $in: ids } },
            { $set: { status: "completed" } }
        );

        // Update Gig Pools (archive them)
        await Pool.updateMany(
            { event: { $in: ids } },
            { $set: { status: "archived" } }
        );
        
        console.log(`[Auto-Update] Completed ${eventsToComplete.length} events and updated related pools.`);
    }

  } catch (error) {
    console.error("[Auto-Update] Error updating event statuses:", error);
  }
};
