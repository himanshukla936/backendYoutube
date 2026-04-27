import multer from "multer";

// const storage = multer.memoryStorage(); // This will store the uploaded files in memory as Buffer objects. You can then process the files as needed (e.g., save to disk, upload to cloud storage, etc.) without saving them directly to the server's filesystem.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/");
  },
  filename: function (req, file, cb) { 
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
