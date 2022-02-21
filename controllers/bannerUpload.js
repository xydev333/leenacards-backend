const express = require("express");
const multer = require("multer");
const path = require("path");

const UPLOAD_DIR = "./public/banner";

class Uploader {
  constructor() {
    this.storage = multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: function(req, file, cb) {
        cb(
          null,
          file.fieldname + "_" + Date.now() + path.extname(file.originalname)
        );
      }
    });
  }

  uploader(field, res) {
    // console.log("innn", field);
    return multer({
      storage: this.storage,
      fileFilter: (req, file, cb) => {
        // console.log("i file filter", file);
        this.checkFileType(file, cb, res);
      }
    }).single(field);
  }

  checkFileType(file, cb, res) {
    // console.log("file.orginalName", file.originalname, file.mimetype);
    // Allowed ext
    // const filetypes = /image\/jpg|image\/jpeg|jpeg|jpg|png|mp4/;
    const filetypes = /image\/jpg|image\/jpeg|jpeg|jpg|png|xls|application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|xlsx/;
    // Check ext
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("File type not allowed");
    }
  }

  handler() {
    const app = express.Router();

    app.post("/:field", (req, res) => {
      // console.log("Enter Upload", req.params.field, req.file, req.uri);

      const upload = this.uploader(req.params.field || "file", res);

      upload(req, res, err => {
        // console.log("in upload function", req.file);
        if (err) {
          // console.log("!!!!!!!!!!!!!!!!!!first err", err);
          res.send({
            code: "ERROR_IN_UPLOAD",
            msg: err
          });
        } else {
          if (req.file == undefined) {
            // console.log("Error: No File Selected!");
            res.send({
              code: "NO_FILE",
              msg: "No file selected"
            });
          } else {
            // console.log("File Uploaded!");
            res.send({
              msg: "File uploaded successfully",
              code: "FILE_UPLOADED",
              file: `${req.file.filename}`
            });
          }
        }
      });
    });

    return app;
  }
}

module.exports = new Uploader().handler();
