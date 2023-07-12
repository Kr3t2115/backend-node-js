const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const { updateProfile } = require("../queries");
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1E9) + ".png";
    const fileName = 'avatar' + uniqueSuffix;
    cb(null, fileName);
  },
});
const upload = multer({ storage });

router.patch('/picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).send('No uploaded file');
      return;
    }

    const extname = path.extname(req.file.originalname).toLowerCase();
    const filePath = `uploads/${req.file.filename}`;

    if(extname == '.jpg' || extname == '.jpeg' || extname == '.png'){
      // the file has allowed extensions
    }else{
      fs.unlinkSync(filePath);
      res.status(400).json({
        "error_message": "The uploaded photo must be .png or .jpg format",
        "error_code": 111
      });
      return;
    }

    const imageInfo = await sharp(filePath).metadata();
    const width = imageInfo.width;
    const height = imageInfo.height;

    if (width !== 128 || height !== 128) {
      fs.unlinkSync(filePath);
      res.status(400).json({
        "error_message": "The uploaded photo must be 128x128 pixels",
        "error_code": 111
      });
      return;
    }

    const update = await updateProfile(req.file.filename, req.user.id)
    if(update == false){
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