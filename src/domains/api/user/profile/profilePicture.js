const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { updateProfile } = require("../queries");

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + ".jpg";
    const fileName = file.fieldname + '-' + uniqueSuffix;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

router.post('/picture', upload.single('profilePicture'), async (req, res) => {
  if (!req.file) {
    res.status(400).send('No uploaded file');
    return;
  }

  try {
    const update = await updateProfile(req.file.filename, req.user.id)
    if(update == false){
      const filePath = `uploads/${req.file.filename}`;
      fs.unlinkSync(filePath);
      res.status(404).json({
        "error_message": "There was a problem with adding your photo",
        "error_code": 111
      });
      return;
    }

    if(update !== null){
      const filepath = `uploads/${update}`;
      fs.stat(filepath, (err, stats) => {
        if (!err) {
          fs.unlinkSync(filepath);
        }
      });  
    }
    res.status(404).json({
      "success_message": "Success",
      "success_code": 311
    });
  } catch (error) {
    const filePath = `uploads/${req.file.filename}`;
    fs.unlinkSync(filePath);
    console.log(error)
    res.status(500).send('An unexpected error');
  }
});

module.exports = router;