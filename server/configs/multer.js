import multer from "multer";

// 🔥 Store files temporarily in memory
const storage = multer.memoryStorage();

// ✅ File filter
const fileFilter = (req, file, cb) => {

  // Allowed image types
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// ✅ Multer upload config
const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;