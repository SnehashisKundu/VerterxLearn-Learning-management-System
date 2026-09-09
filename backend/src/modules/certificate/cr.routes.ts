import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

import * as certificateController from "./cr.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("student"),
  certificateController.issueCertificate,
);

router.get(
  "/my",
  authenticate,
  authorize("student"),
  certificateController.getMyCertificates,
);

router.get(
  "/:certificateId",
  authenticate,
  authorize("student"),
  certificateController.getCertificateById,
);

export default router;