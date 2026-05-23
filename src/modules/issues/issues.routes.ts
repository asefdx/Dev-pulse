import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import * as issuesController from "./issues.controller";

const router = Router();

router.get("/", issuesController.getAllIssues);
router.get("/:id", issuesController.getIssueById);
router.post("/", authenticate, issuesController.createIssue);
router.patch("/:id", authenticate, issuesController.updateIssue);
router.delete(
  "/:id",
  authenticate,
  authorize("maintainer"),
  issuesController.deleteIssue,
);

export default router;