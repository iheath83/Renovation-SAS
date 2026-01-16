export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.params) {
      // Express 5 has readonly params, store parsed values separately
      const parsedParams = schema.params.parse(req.params);
      req.validatedParams = parsedParams;
      // Copy parsed values to a mutable object accessible via req.params
      for (const key in parsedParams) {
        Object.defineProperty(req.params, key, {
          value: parsedParams[key],
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }
    if (schema.query) {
      // Express 5 may have readonly query, handle similarly
      const parsedQuery = schema.query.parse(req.query);
      req.validatedQuery = parsedQuery;
      for (const key in parsedQuery) {
        try {
          req.query[key] = parsedQuery[key];
        } catch {
          // If assignment fails (readonly), store in validatedQuery only
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

