// Soft delete middleware for models
export const softDelete = (schema) => {
  // Add deleted field
  schema.add({
    deleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  });

  // Override find methods to exclude deleted documents
  schema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
    this.where({ deleted: { $ne: true } });
  });

  // Override count methods
  schema.pre('count', function() {
    this.where({ deleted: { $ne: true } });
  });

  // Add soft delete method
  schema.methods.softDelete = function() {
    this.deleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  // Add restore method
  schema.methods.restore = function() {
    this.deleted = false;
    this.deletedAt = null;
    return this.save();
  };

  // Add static method to find deleted documents
  schema.statics.findDeleted = function() {
    return this.find({ deleted: true });
  };

  // Add static method to find with deleted documents
  schema.statics.findWithDeleted = function() {
    return this.find();
  };
};
