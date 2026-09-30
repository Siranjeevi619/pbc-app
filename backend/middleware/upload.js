const multer = require('multer');
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // Keep the compressed file inside MongoDB's document-size limit.
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = upload;
