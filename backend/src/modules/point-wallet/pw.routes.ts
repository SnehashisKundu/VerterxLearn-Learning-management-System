import { Router } from "express";
import {
  getMyWallet,
  getMyTransactions,
  earn,
  adjust,
} from "./pw.controller";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";

const router = Router();

// Student's own wallet
router.get(
  "/me",
  authenticate,
  getMyWallet,
);

// Student's own transaction history
router.get(
  "/me/transactions",
  authenticate,
  getMyTransactions,
);

// Controlled point earning
router.post(
  "/earn",
  authenticate,
  earn,
);

// Admin adjustment
router.post(
  "/:userId/adjust",
  authenticate,
  authorize("admin"),
  adjust,
);

export default router;