const mongoose = require('mongoose');

const teacherSpaceSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  formationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formation', 
    required: false // Made optional as some spaces might not be tied to specific formations
  },
  title: { type: String, required: true },
  description: { type: String },
  password: { type: String, required: true },
  expiryDate: { type: Date }, // When the space expires
  allowDownload: { type: Boolean, default: true }, // Whether students can download files
  
  // Enhanced file structure with more metadata
  files: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true }, // Original filename
    path: { type: String, required: true }, // Server file path
    url: { type: String, required: true }, // Public URL for access
    type: { 
      type: String, 
      required: true, 
      enum: ['document', 'image', 'video', 'other'] 
    },
    mimeType: { type: String, required: true }, // MIME type
    size: { type: Number, required: true }, // File size in bytes
    category: { 
      type: String, 
      default: 'document',
      enum: ['document', 'image', 'video', 'other']
    },
    description: { type: String }, // Optional file description
    uploadedAt: { type: Date, default: Date.now },
    downloadCount: { type: Number, default: 0 }, // Track downloads
    isActive: { type: Boolean, default: true } // Can be disabled without deletion
  }],
  
  // Enhanced link structure with categorization
  links: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String }, // Optional link description
    category: { 
      type: String, 
      default: 'general',
      enum: ['general', 'resource', 'assignment', 'reference']
    },
    favicon: { type: String }, // URL to favicon if available
    preview: {
      title: { type: String },
      description: { type: String },
      image: { type: String }
    }, // Link preview metadata
    clickCount: { type: Number, default: 0 }, // Track clicks
    addedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true } // Can be disabled without deletion
  }],
  
  // Access and permission settings
  students: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Space settings
  settings: {
    allowComments: { type: Boolean, default: false },
    allowStudentUploads: { type: Boolean, default: false },
    maxFileSize: { type: Number, default: 50 * 1024 * 1024 }, // 50MB default
    allowedFileTypes: [{ type: String }], // Array of allowed MIME types
    requireApproval: { type: Boolean, default: false }, // Require approval for student uploads
    notifyOnUpload: { type: Boolean, default: true }, // Notify teacher on new uploads
    theme: { 
      type: String, 
      default: 'default',
      enum: ['default', 'dark', 'light', 'colorful']
    }
  },
  
  // Analytics and tracking
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalDownloads: { type: Number, default: 0 },
    totalLinkClicks: { type: Number, default: 0 },
    lastAccessed: { type: Date },
    popularFiles: [{ 
      fileId: { type: mongoose.Schema.Types.ObjectId },
      downloads: { type: Number, default: 0 }
    }],
    popularLinks: [{ 
      linkId: { type: mongoose.Schema.Types.ObjectId },
      clicks: { type: Number, default: 0 }
    }]
  },
  
  // Activity log
  activityLog: [{
    action: { 
      type: String, 
      enum: ['file_uploaded', 'file_downloaded', 'link_added', 'link_clicked', 'space_accessed', 'space_modified',"space_created","password_verified"]
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: mongoose.Schema.Types.Mixed }, // Additional action details
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    userAgent: { type: String }
  }],
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
teacherSpaceSchema.index({ teacherId: 1, isActive: 1 });
teacherSpaceSchema.index({ formationId: 1 });
teacherSpaceSchema.index({ expiryDate: 1 });
teacherSpaceSchema.index({ 'students': 1 });
teacherSpaceSchema.index({ createdAt: -1 });

// Update the updatedAt field before saving
teacherSpaceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if space is expired
teacherSpaceSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for total file size
teacherSpaceSchema.virtual('totalFileSize').get(function() {
  return this.files.reduce((total, file) => total + (file.size || 0), 0);
});

// Virtual for active files count
teacherSpaceSchema.virtual('activeFilesCount').get(function() {
  return this.files.filter(file => file.isActive).length;
});

// Virtual for active links count
teacherSpaceSchema.virtual('activeLinksCount').get(function() {
  return this.links.filter(link => link.isActive).length;
});

// Method to add file
teacherSpaceSchema.methods.addFile = function(fileData) {
  this.files.push(fileData);
  this.analytics.totalDownloads = this.files.reduce((total, file) => total + file.downloadCount, 0);
  return this.save();
};

// Method to add link
teacherSpaceSchema.methods.addLink = function(linkData) {
  this.links.push(linkData);
  return this.save();
};

// Method to remove file
teacherSpaceSchema.methods.removeFile = function(fileId) {
  this.files = this.files.filter(file => file._id.toString() !== fileId.toString());
  return this.save();
};

// Method to remove link
teacherSpaceSchema.methods.removeLink = function(linkId) {
  this.links = this.links.filter(link => link._id.toString() !== linkId.toString());
  return this.save();
};

// Method to log activity
teacherSpaceSchema.methods.logActivity = function(action, userId, details = {}, req = null) {
  const logEntry = {
    action,
    userId,
    details,
    timestamp: new Date()
  };
  
  if (req) {
    logEntry.ipAddress = req.ip || req.connection.remoteAddress;
    logEntry.userAgent = req.get('User-Agent');
  }
  
  this.activityLog.push(logEntry);
  
  // Keep only last 100 activity entries to prevent document from growing too large
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
  
  return this.save();
};

// Method to increment view count
teacherSpaceSchema.methods.incrementViews = function() {
  this.analytics.totalViews += 1;
  this.analytics.lastAccessed = new Date();
  return this.save();
};

// Method to track file download
teacherSpaceSchema.methods.trackFileDownload = function(fileId) {
  const file = this.files.id(fileId);
  if (file) {
    file.downloadCount += 1;
    this.analytics.totalDownloads += 1;
    
    // Update popular files
    const popularFile = this.analytics.popularFiles.find(pf => pf.fileId.toString() === fileId.toString());
    if (popularFile) {
      popularFile.downloads += 1;
    } else {
      this.analytics.popularFiles.push({ fileId, downloads: 1 });
    }
    
    // Keep only top 10 popular files
    this.analytics.popularFiles.sort((a, b) => b.downloads - a.downloads);
    this.analytics.popularFiles = this.analytics.popularFiles.slice(0, 10);
  }
  return this.save();
};

// Method to track link click
teacherSpaceSchema.methods.trackLinkClick = function(linkId) {
  const link = this.links.id(linkId);
  if (link) {
    link.clickCount += 1;
    this.analytics.totalLinkClicks += 1;
    
    // Update popular links
    const popularLink = this.analytics.popularLinks.find(pl => pl.linkId.toString() === linkId.toString());
    if (popularLink) {
      popularLink.clicks += 1;
    } else {
      this.analytics.popularLinks.push({ linkId, clicks: 1 });
    }
    
    // Keep only top 10 popular links
    this.analytics.popularLinks.sort((a, b) => b.clicks - a.clicks);
    this.analytics.popularLinks = this.analytics.popularLinks.slice(0, 10);
  }
  return this.save();
};

// Static method to find spaces by teacher
teacherSpaceSchema.statics.findByTeacher = function(teacherId, options = {}) {
  const query = { teacherId };
  
  if (options.activeOnly) {
    query.isActive = true;
  }
  
  if (options.notExpired) {
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ];
  }
  
  return this.find(query)
    .populate('formationId', 'name')
    .populate('students', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find spaces accessible by student
teacherSpaceSchema.statics.findByStudent = function(studentId, options = {}) {
  const query = { 
    students: studentId,
    isActive: true
  };
  
  if (options.notExpired) {
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ];
  }
  
  return this.find(query)
    .populate('teacherId', 'name email')
    .populate('formationId', 'name')
    .sort({ createdAt: -1 });
};

// Ensure virtual fields are serialized
teacherSpaceSchema.set('toJSON', { virtuals: true });
teacherSpaceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TeacherSpace', teacherSpaceSchema);

