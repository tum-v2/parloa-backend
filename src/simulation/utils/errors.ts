/**
 * Returns response for 500 Internal Server Error
 * @param error - Raised error
 * @returns An object containing code, message and details
 */
function INTERNAL_SERVER_ERROR(error: unknown) {
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error occurred',
    details: error instanceof Error ? error.message : String(error),
  };
}

/**
 * Returns response for 400 Bad Request
 * @param error - Raised error
 * @returns An object containing code, message and details
 */
function BAD_REQUEST(error: unknown) {
  return {
    code: 'BAD_REQUEST',
    message: 'Bad request',
    details: error instanceof Error ? error.message : String(error),
  };
}

export { INTERNAL_SERVER_ERROR, BAD_REQUEST };
