const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  // Pre-query hooks to filter out soft-deleted documents
  const excludeDeleted = function () {
    this.where({ isDeleted: { $ne: true } });
  };

  schema.pre("find", excludeDeleted);
  schema.pre("findOne", excludeDeleted);
  schema.pre("findOneAndUpdate", excludeDeleted);
  schema.pre("update", excludeDeleted);
  schema.pre("updateMany", excludeDeleted);
  schema.pre("countDocuments", excludeDeleted);

  // Soft delete method
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return await this.save();
  };
};

module.exports = softDeletePlugin;
