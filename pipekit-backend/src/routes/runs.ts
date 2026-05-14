import { Router } from 'express';
import { getRun, getStepLogs } from '../controllers/runs';

const router = Router();

router.get('/:id', getRun);
router.get('/:id/logs/:stepId', getStepLogs);

export default router;