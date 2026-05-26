const express = require('express');
const router = express.Router();
const { uploadMaterial, getEventMaterials, downloadMaterial, deleteMaterial } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/event/:eventId', getEventMaterials);
router.get('/:id/download', downloadMaterial);
router.post('/', authorize('trainer', 'admin'), upload.single('file'), uploadMaterial);
router.delete('/:id', authorize('trainer', 'admin'), deleteMaterial);

module.exports = router;
