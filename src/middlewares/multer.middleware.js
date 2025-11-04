import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Public/temp")
  },
  filename: (req, file, cb) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const cleanName = file.originalname.replace(/\s+/g, '_');
  cb(null, `${uniqueSuffix}-${cleanName}`);
}
})

const upload = multer({ storage: storage })
export{ upload };