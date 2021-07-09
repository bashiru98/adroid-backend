import { Router } from "express";
import {uploadImagesToS3} from "../controllers/upload";
import {protect} from "../middleware/auth"


  const router = new Router();

  // add a new files
router.post("/adroid/images", protect, uploadImagesToS3);
  

  // edit an uploaded file
  router.put("/:_id", async (req, res) => {
    try{
      const result = await uploadController.create(req.body, req._context);
      res.status(200).json(result);
    }
    catch(err) {
      throw err;
    }
  });

  // delete an uploaded file
  router.delete("/:_id", async (req, res) => {
    try{
      const result = await uploadController.create(req.body, req._context);
      res.status(200).json(result);
    }
    catch(err) {
      throw err;
    }
  });

module.exports = router;