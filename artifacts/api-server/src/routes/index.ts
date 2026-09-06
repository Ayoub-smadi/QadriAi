import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import designRouter from "./design";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(designRouter);

export default router;
