const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const defaultPageSize = parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
  const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE) || 100;
  const requestedLimit = parseInt(query.limit) || defaultPageSize;
  const limit = Math.min(requestedLimit, maxPageSize);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

const buildPaginationResponse = (page, limit, totalCount) => {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    currentPage: page,
    pageSize: limit,
    totalItems: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationResponse,
};
