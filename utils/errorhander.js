// Here, a class named ErrorHandler is declared, extending the built-in JavaScript Error class. This means ErrorHandler inherits properties and methods from the Error class.
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
