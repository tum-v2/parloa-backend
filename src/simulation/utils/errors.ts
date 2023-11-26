/**
 * Returns response for Internal Error
 * @param error - Raised error
 * @param updates - The updates to apply to the simulation object.
 * @returns An object containing code, message and details
 */
function INTERNAL_SERVER_ERROR(error: unknown) {
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error occurred',
    details: error instanceof Error ? error.message : String(error),
  };
}

export { INTERNAL_SERVER_ERROR };
