// desc this class is responsible about operation errors {errors that i can predict }
// class ApiError extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode(4)}`.startsWith(4) ? "fail" : "error";
//     this.isOperational = true;
//   }
// }
// module.exports = ApiError;
///////////
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // التعديل هنا: بنحول الـ statusCode لـ string الأول
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

module.exports = ApiError;
