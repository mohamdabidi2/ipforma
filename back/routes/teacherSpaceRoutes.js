const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp'); // For image processing
const ffmpeg = require('fluent-ffmpeg'); // For video processing
const TeacherSpace = require('../models/TeacherSpace');
const { protect, authorize } = require('../middlewares/authMiddleware');

const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/teacher-spaces', req.params.spaceId);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving extension
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files per upload
  }
});

// Helper function to determine file category
const getFileCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.includes('pdf') || mimetype.includes('document') || mimetype.includes('text')) return 'document';
  return 'other';
};

// Helper function to generate thumbnail for images
const generateThumbnail = async (filePath, outputPath) => {
  try {
    await sharp(filePath)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return false;
  }
};

// Helper function to get link preview
const getLinkPreview = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
      }
    });

    const html = response.data;
    const preview = {};

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) preview.title = titleMatch[1].trim();

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    if (descMatch) preview.description = descMatch[1].trim();

    // Extract Open Graph image
    const ogImageMatch = html.match(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
    if (ogImageMatch) preview.image = ogImageMatch[1];

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=["\'](?:shortcut )?icon["\'][^>]*href=["\']([^"']+)["\'][^>]*>/i);
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1];
      preview.favicon = faviconUrl.startsWith('http') ? faviconUrl : new URL(faviconUrl, url).href;
    }

    return preview;
  } catch (error) {
    console.error('Error getting link preview:', error);
    return {};
  }
};

// NEW: Get all available spaces for table display
router.get('/all-spaces-table', protect, async (req, res) => {
  try {
    const spaces = await TeacherSpace.find({ 
      isActive: true 
    })
    .populate('teacherId', 'name email')
    .populate('formationId', 'name')
    .select('title description teacherId formationId files links expiryDate createdAt updatedAt analytics')
    .sort({ updatedAt: -1 });

    // Format data for table display
    const tableData = spaces.map(space => ({
      _id: space._id,
      title: space.title,
      description: space.description,
      teacher: {
        name: space.teacherId?.name || 'Unknown',
        email: space.teacherId?.email || ''
      },
      formation: space.formationId?.name || 'Aucune',
      filesCount: space.files?.filter(file => file.isActive).length || 0,
      linksCount: space.links?.filter(link => link.isActive).length || 0,
      totalViews: space.analytics?.totalViews || 0,
      lastUpdated: space.updatedAt,
      expiryDate: space.expiryDate,
      isExpired: space.expiryDate ? new Date(space.expiryDate) < new Date() : false,
      status: space.expiryDate && new Date(space.expiryDate) < new Date() ? 'expired' : 'active'
    }));

    res.json({
      success: true,
      data: tableData,
      total: tableData.length
    });
  } catch (error) {
    console.error('Error fetching spaces for table:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// NEW: Verify space password and grant access
router.post('/:spaceId/verify-password', protect, [
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const space = await TeacherSpace.findById(req.params.spaceId)
      .populate('teacherId', 'name email');

    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: 'Space not found' 
      });
    }

    if (!space.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Space is not active' 
      });
    }

    if (space.expiryDate && new Date(space.expiryDate) < new Date()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Space has expired' 
      });
    }

    // Verify password
    if (space.password !== req.body.password) {
      await space.logActivity('password_failed', req.user.id, { 
        spaceTitle: space.title 
      }, req);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password' 
      });
    }

    // Add user to students array if not already present
    if (!space.students.includes(req.user.id)) {
      space.students.push(req.user.id);
      await space.save();
    }

    // Log successful access
    await space.logActivity('password_verified', req.user.id, { 
      spaceTitle: space.title 
    }, req);

    res.json({
      success: true,
      message: 'Access granted',
      space: {
        _id: space._id,
        title: space.title,
        description: space.description,
        teacher: space.teacherId
      }
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// NEW: Get user's accessible spaces (spaces they have password access to)
router.get('/my-accessible-spaces', protect, async (req, res) => {
  try {
    const spaces = await TeacherSpace.find({ 
      students: req.user.id,
      isActive: true 
    })
    .populate('teacherId', 'name email')
    .populate('formationId', 'name')
    .sort({ updatedAt: -1 });

    const accessibleSpaces = spaces.map(space => ({
      _id: space._id,
      title: space.title,
      description: space.description,
      teacher: space.teacherId,
      formation: space.formationId,
      filesCount: space.files?.filter(file => file.isActive).length || 0,
      linksCount: space.links?.filter(link => link.isActive).length || 0,
      lastUpdated: space.updatedAt,
      expiryDate: space.expiryDate,
      isExpired: space.expiryDate ? new Date(space.expiryDate) < new Date() : false
    }));

    res.json({
      success: true,
      data: accessibleSpaces
    });
  } catch (error) {
    console.error('Error fetching accessible spaces:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all teacher spaces for the authenticated teacher
router.get('/my-spaces', protect, async (req, res) => {
  try {
    const spaces = await TeacherSpace.findByTeacher(req.user.id, {
      activeOnly: req.query.activeOnly === 'true',
      notExpired: req.query.notExpired === 'true'
    });
    
    res.json(spaces);
  } catch (error) {
    console.error('Error fetching teacher spaces:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific teacher space with enhanced access control
router.get('/:spaceId', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId)
      .populate('teacherId', 'name email')
      .populate('formationId', 'name')
      .populate('students', 'name email');

    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user has access (teacher or student)
    const isTeacher = space.teacherId._id.toString() === req.user.id;
    const isStudent = space.students.some(student => student._id.toString() === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment view count if student is accessing
    if (isStudent) {
      await space.incrementViews();
      await space.logActivity('space_accessed', req.user.id, {}, req);
    }

    res.json(space);
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get space content (files and links) for accessible spaces
router.get('/:spaceId/content', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);

    if (!space) {
      return res.status(404).json({ 
        success: false, 
        message: 'Space not found' 
      });
    }

    // Check if user has access (teacher or student)
    const isTeacher = space.teacherId.toString() === req.user.id;
    const isStudent = space.students.some(student => student._id.toString() === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Filter active files and links
    const activeFiles = space.files.filter(file => file.isActive);
    const activeLinks = space.links.filter(link => link.isActive);

    // Categorize files
    const categorizedFiles = {
      images: activeFiles.filter(file => file.type === 'image'),
      videos: activeFiles.filter(file => file.type === 'video'),
      documents: activeFiles.filter(file => file.type === 'document'),
      others: activeFiles.filter(file => file.type === 'other')
    };

    res.json({
      success: true,
      data: {
        files: activeFiles,
        links: activeLinks,
        categorized: categorizedFiles,
        space: {
          title: space.title,
          description: space.description,
          allowDownload: space.allowDownload
        }
      }
    });
  } catch (error) {
    console.error('Error fetching space content:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create a new teacher space
router.post('/', protect, [
  body('title').notEmpty().withMessage('Title is required'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const spaceData = {
      ...req.body,
      teacherId: req.user.id,
      settings: {
        allowComments: req.body.allowComments || false,
        allowStudentUploads: req.body.allowStudentUploads || false,
        maxFileSize: req.body.maxFileSize || 50 * 1024 * 1024,
        allowedFileTypes: req.body.allowedFileTypes || [],
        requireApproval: req.body.requireApproval || false,
        notifyOnUpload: req.body.notifyOnUpload || true,
        theme: req.body.theme || 'default'
      }
    };

    const space = new TeacherSpace(spaceData);
    await space.save();

    await space.logActivity('space_created', req.user.id, { spaceTitle: space.title }, req);

    res.status(201).json(space);
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a teacher space
router.put('/:spaceId', protect, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('password').optional().isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user is the teacher
    if (space.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update space
    Object.assign(space, req.body);
    if (req.body.settings) {
      Object.assign(space.settings, req.body.settings);
    }

    await space.save();
    await space.logActivity('space_modified', req.user.id, { changes: Object.keys(req.body) }, req);

    res.json(space);
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a teacher space
router.delete('/:spaceId', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user is the teacher
    if (space.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete associated files from filesystem
    const uploadDir = path.join(__dirname, '../uploads/teacher-spaces', req.params.spaceId);
    try {
      await fs.rmdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error deleting files:', error);
    }

    await TeacherSpace.findByIdAndDelete(req.params.spaceId);
    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload files to a space
router.post('/:spaceId/upload', protect, upload.array('files'), async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user has upload permission
    const isTeacher = space.teacherId.toString() === req.user.id;
    const isStudent = space.students.some(student => student._id.toString() === req.user.id);
    
    if (!isTeacher && (!isStudent || !space.settings.allowStudentUploads)) {
      return res.status(403).json({ message: 'Upload not allowed' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    for (const file of req.files) {
      const category = req.body.category || getFileCategory(file.mimetype);
      const fileUrl = `${baseUrl}/uploads/teacher-spaces/${req.params.spaceId}/${file.filename}`;
      
      const fileData = {
        name: file.filename,
        originalName: file.originalname,
        path: file.path,
        url: fileUrl,
        type: category,
        mimeType: file.mimetype,
        size: file.size,
        category: category,
        description: req.body.description || '',
        uploadedAt: new Date(),
        isActive: !space.settings.requireApproval || isTeacher
      };

      // Generate thumbnail for images
      if (category === 'image') {
        const thumbnailPath = path.join(path.dirname(file.path), `thumb_${file.filename}`);
        const thumbnailGenerated = await generateThumbnail(file.path, thumbnailPath);
        if (thumbnailGenerated) {
          fileData.thumbnail = `${baseUrl}/uploads/teacher-spaces/${req.params.spaceId}/thumb_${file.filename}`;
        }
      }

      space.files.push(fileData);
      uploadedFiles.push(fileData);
    }

    await space.save();
    await space.logActivity('file_uploaded', req.user.id, { 
      fileCount: req.files.length,
      fileNames: req.files.map(f => f.originalname)
    }, req);

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      space: space
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download a file
router.get('/:spaceId/files/:fileId/download', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    const file = space.files.id(req.params.fileId);
    if (!file || !file.isActive) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access permissions
    const isTeacher = space.teacherId.toString() === req.user.id;
    const isStudent = space.students.some(student => student._id.toString() === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!isTeacher && !space.allowDownload) {
      return res.status(403).json({ message: 'Download not allowed' });
    }

    // Check if file exists
    try {
      await fs.access(file.path);
    } catch (error) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Track download
    await space.trackFileDownload(req.params.fileId);
    await space.logActivity('file_downloaded', req.user.id, { 
      fileName: file.originalName,
      fileId: req.params.fileId
    }, req);

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    
    // Stream the file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a file
router.delete('/:spaceId/files/:fileId', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user is the teacher
    if (space.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const file = space.files.id(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(file.path);
      // Delete thumbnail if exists
      if (file.thumbnail) {
        const thumbnailPath = path.join(path.dirname(file.path), `thumb_${file.name}`);
        await fs.unlink(thumbnailPath).catch(() => {}); // Ignore errors
      }
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
    }

    // Remove from database
    await space.removeFile(req.params.fileId);
    
    res.json({ message: 'File deleted successfully', space: space });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a link to a space
router.post('/:spaceId/add-link', protect, [
  body('title').notEmpty().withMessage('Title is required'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('description').optional().isLength({ max: 300 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user is the teacher
    if (space.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get link preview
    const preview = await getLinkPreview(req.body.url);

    const linkData = {
      title: req.body.title,
      url: req.body.url,
      description: req.body.description || '',
      category: req.body.category || 'general',
      preview: preview,
      favicon: preview.favicon,
      addedAt: new Date()
    };

    await space.addLink(linkData);
    await space.logActivity('link_added', req.user.id, { 
      linkTitle: req.body.title,
      linkUrl: req.body.url
    }, req);

    res.status(201).json({
      message: 'Link added successfully',
      link: linkData,
      space: space
    });
  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track link click
router.post('/:spaceId/links/:linkId/click', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check access permissions
    const isTeacher = space.teacherId.toString() === req.user.id;
    const isStudent = space.students.some(student => student._id.toString() === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const link = space.links.id(req.params.linkId);
    if (!link || !link.isActive) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Track click
    await space.trackLinkClick(req.params.linkId);
    await space.logActivity('link_clicked', req.user.id, { 
      linkTitle: link.title,
      linkUrl: link.url,
      linkId: req.params.linkId
    }, req);

    res.json({ 
      message: 'Click tracked',
      url: link.url 
    });
  } catch (error) {
    console.error('Error tracking link click:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a link
router.delete('/:spaceId/links/:linkId', protect, async (req, res) => {
  try {
    const space = await TeacherSpace.findById(req.params.spaceId);
    if (!space) {
      return res.status(404).json({ message: 'Space not found' });
    }

    // Check if user is the teacher
    if (space.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const link = space.links.id(req.params.linkId);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Remove from database
    await space.removeLink(req.params.linkId);
    
    res.json({ message: 'Link deleted successfully', space: space });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

