const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv")
const fs = require("fs")
const { v4 } = require('uuid')
dotenv.config({ path: ".env" });

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const imageFilesFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg" ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG, jpg and PNG is allowed!"), false);
  }
};


const uploadImages = multer({
    imageFilesFilter,
  storage: multerS3({
    acl: "public-read",
    s3: s3,
    bucket: `${process.env.S3_BUCKET_NAME}`,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      let est = file.mimetype === "image/jpg" ? ".jpg" : ".png";
      cb(null, "packages/" + Date.now().toString() + est);
    },
  }),
});

const singleImageFileUpload = uploadImages.single('image')


const uploadImagesToS3 =  (req,res,file) => {
req.s3key = v4();

return new Promise((resolve, reject) => {

 return singleImageFileUpload(req,res,err => {
  
if(err) {
            return reject(err)
}
console.log("url",req.file.location)
return res.status(200).send(req.file.location)
 })
})
}


    
  
module.exports = {
uploadImagesToS3,

};