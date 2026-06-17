/**
 * Standardize API Response utility
 */
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message, error = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
  };
  if (error) {
    response.error = error.message || error;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
};
