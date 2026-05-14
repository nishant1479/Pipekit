import { Router } from 'express';
import {
  getPipelines,
  getPipelineById,
  createPipeline,
  updatePipeline,
  deletePipeline,
} from '../controllers/pipelines';
import { triggerRun } from '../controllers/runs';

const router = Router();

router.get('/', getPipelines);
router.get('/:id', getPipelineById);
router.post('/', createPipeline);
router.put('/:id', updatePipeline);
router.delete('/:id', deletePipeline);
router.post('/:id/runs', triggerRun);

export default router;