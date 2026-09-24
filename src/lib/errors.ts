/**
 * Domain errors thrown by services. Route handlers and server actions map
 * these to HTTP responses / form state; React components never see raw
 * database errors.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in.") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found.`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = "CONFLICT", details?: Record<string, unknown>) {
    super(message, 409, code, details);
  }
}

export class DuplicateEnrollmentError extends ConflictError {
  constructor(public readonly applicationNumber: string) {
    super("You are already enrolled in this exam.", "DUPLICATE_ENROLLMENT", { applicationNumber });
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, code = "BUSINESS_RULE") {
    super(message, 422, code);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
