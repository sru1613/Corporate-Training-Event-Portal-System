const TrainingMaterial = require('../models/TrainingMaterial');
const Notification = require('../models/Notification');
const Registration = require('../models/Registration');
const path = require('path');
const fs = require('fs');

// @desc    Upload material
// @route   POST /api/materials
// @access  Trainer / Admin
const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { eventId, title, description, fileType, isPublic } = req.body;

    const material = await TrainingMaterial.create({
      event: eventId,
      uploadedBy: req.user._id,
      title,
      description,
      fileType: fileType || 'Other',
      fileName: req.file.originalname,
      filePath: `/uploads/materials/${req.file.filename}`,
      fileSize: req.file.size,
      isPublic: isPublic !== 'false'
    });

    // Notify registered employees
    const registrations = await Registration.find({ event: eventId, status: 'Confirmed' });
    const notifs = registrations.map(r => ({
      recipient: r.employee,
      sender: req.user._id,
      type: 'MATERIAL_UPLOADED',
      title: 'New Training Material',
      message: `New material "${title}" has been uploaded for your training event.`,
      relatedEvent: eventId
    }));
    if (notifs.length > 0) await Notification.insertMany(notifs);

    await material.populate('uploadedBy', 'name email');
    res.status(201).json({ success: true, message: 'Material uploaded successfully', data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get materials for event
// @route   GET /api/materials/event/:eventId
// @access  Private
const getEventMaterials = async (req, res) => {
  try {
    const materials = await TrainingMaterial.find({ event: req.params.eventId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download material
// @route   GET /api/materials/:id/download
// @access  Private
const downloadMaterial = async (req, res) => {
  try {
    const material = await TrainingMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    await TrainingMaterial.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });

    const filePath = path.join(__dirname, '..', material.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }
    res.download(filePath, material.fileName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Trainer (own) / Admin
const deleteMaterial = async (req, res) => {
  try {
    const material = await TrainingMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
    }

    // Delete file from server
    const filePath = path.join(__dirname, '..', material.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await TrainingMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadMaterial, getEventMaterials, downloadMaterial, deleteMaterial };
