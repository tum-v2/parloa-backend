function INTERNAL_SERVER_ERROR(error: unknown) {
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error occurred',
    details: error instanceof Error ? error.message : String(error),
  };
}

export { INTERNAL_SERVER_ERROR };
