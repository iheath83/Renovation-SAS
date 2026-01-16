export const successResponse = (data) => ({
  success: true,
  data,
});

export const listResponse = (data, pagination) => ({
  success: true,
  data,
  pagination,
});

export const errorResponse = (message, code = 'ERROR', details = null) => ({
  success: false,
  error: {
    message,
    code,
    ...(details && { details }),
  },
});

