class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: string[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
  }
}

export { ApiError };
