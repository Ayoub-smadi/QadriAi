import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import designRouter from "./design";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(designRouter);
router.use(aiRouter);

export default router;
