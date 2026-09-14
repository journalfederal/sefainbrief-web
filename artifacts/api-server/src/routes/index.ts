import { Router, type IRouter } from "express";
import healthRouter from "./health";
import channelFeedRouter from "./channel-feed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(channelFeedRouter);

export default router;
