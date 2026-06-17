/**
 * Reusable Mongoose pagination utility
 */
const paginate = async (model, filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  let sort = {};
  if (options.sort) {
    if (typeof options.sort === "string") {
      const parts = options.sort.split(",");
      parts.forEach((part) => {
        let order = 1;
        let field = part.trim();
        if (field.startsWith("-")) {
          order = -1;
          field = field.substring(1);
        }
        sort[field] = order;
      });
    } else {
      sort = options.sort;
    }
  } else {
    sort = { createdAt: -1 }; // Default sort
  }

  // Count documents
  const totalCount = await model.countDocuments(filter);

  // Get data query
  let query = model.find(filter).sort(sort).skip(skip).limit(limit);

  // Population
  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((pop) => {
        query = query.populate(pop);
      });
    } else {
      query = query.populate(options.populate);
    }
  }

  // Select fields (Projection)
  if (options.select) {
    query = query.select(options.select);
  }

  const results = await query;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    results,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

module.exports = paginate;
