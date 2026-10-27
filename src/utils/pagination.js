function parsePagination(query) {
  const page = Number(query.page ?? 1);
  const requestedLimit = Number(query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page <= 0 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit <= 0
  ) {
    return {
      error: "page and limit must be positive integers",
    };
  }

  const limit = Math.min(requestedLimit, 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

module.exports = {
  parsePagination,
  buildMeta,
};
