const generateResponse = (status, response, error = {}) => {
  return {
    status: status,
    response: response,
    error: error,
  };
};

module.exports = generateResponse;
