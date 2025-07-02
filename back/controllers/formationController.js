const Formation = require("../models/formation");
const path = require("path");
const User = require("../models/User");

// Create a new formation
exports.createFormation = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      durationWeeks,
      estimatedHours,
      type,
      category,
      categoryPrefix,
      level,
      maxStudents,
      prerequisites,
      objectives,
      isActive,
      tags,
      thumbnail,
      difficulty,
      formationCode,
      content, // This will now be the full content structure
      reviews,
      professors,
    } = req.body;

    // Parse incoming JSON fields if needed
    const parsedTags = Array.isArray(tags) ? tags : tags ? JSON.parse(tags) : [];
    const parsedContent = Array.isArray(content) ? content : content ? JSON.parse(content) : [];
    const parsedReviews = Array.isArray(reviews) ? reviews : reviews ? JSON.parse(reviews) : [];
    const parsedProfessors = Array.isArray(professors) ? professors : professors ? JSON.parse(professors) : [];

    const formation = await Formation.create({
      title,
      description,
      price,
      durationWeeks,
      estimatedHours,
      type,
      category,
      categoryPrefix,
      level,
      maxStudents,
      prerequisites,
      objectives,
      isActive: isActive !== undefined ? isActive : true,
      tags: parsedTags,
      thumbnail,
      difficulty: difficulty || 1,
      formationCode,
      content: parsedContent,
      reviews: parsedReviews,
      professors: parsedProfessors,
    });

    res.status(201).json({ message: "Formation created successfully", formation });
  } catch (error) {
    res.status(500).json({ message: `Failed to create formation: ${error.message}` });
  }
};

// Get all formations
exports.getFormations = async (req, res) => {
  try {
    const formations = await Formation.find();
    res.json(formations); // Return array directly
  } catch (error) {
    res.status(500).json({ message: `Failed to retrieve formations: ${error.message}` });
  }
};


//get my formations 
exports.getFormationsMy = async (req, res) => {
  try {
    // 1. Get the current user's ID (assuming it's available in req.user)
    const userId = req.user._id;
    
    // 2. Find the user to get their formations array
    const user = await User.findById(userId);
    
    // 3. If user has no formations, return empty array
    if (!user.formations || user.formations.length === 0) {
      console.log("vide")
      return res.json([]);
    }
    
    // 4. Find all formations where the formation._id is in user.formations
    // Note: This assumes user.formations contains Formation IDs
    console.log(user.formations.map((el)=>el._id))
    const formations = await Formation.find({
      _id: { $in: user.formations.map((el)=>el._id) }
    });
    
    res.json(formations);
  } catch (error) {
    res.status(500).json({ message: `Failed to retrieve formations: ${error.message}` });
  }
};
exports.getFormationsList = async (req, res) => {
  try {
    const formations = await Formation.find({}, "title _id"); // Sélectionner uniquement l'ID et le titre
    res.status(200).json(formations);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get a single formation by ID
exports.getFormationById = async (req, res) => {
  try {
    const { id } = req.params;
    const formation = await Formation.findById(id);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }
    res.json(formation); // Return formation directly
  } catch (error) {
    res.status(500).json({ message: `Failed to retrieve formation: ${error.message}` });
  }
};

// Update a formation
exports.updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Safely parse JSON fields if needed
    if (updates.reviews && typeof updates.reviews === "string") {
      updates.reviews = JSON.parse(updates.reviews);
    }
    if (updates.content && typeof updates.content === "string") {
      updates.content = JSON.parse(updates.content);
    }
    if (updates.professors && typeof updates.professors === "string") {
      updates.professors = JSON.parse(updates.professors);
    }
    if (updates.tags && typeof updates.tags === "string") {
      updates.tags = JSON.parse(updates.tags);
    }

    const formation = await Formation.findByIdAndUpdate(id, updates, { new: true });
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    res.json({ message: "Formation updated successfully", formation });
  } catch (error) {
    res.status(500).json({ message: `Failed to update formation: ${error.message}` });
  }
};

// Delete a formation
exports.deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const formation = await Formation.findByIdAndDelete(id);
    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    res.json({ message: "Formation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete formation: ${error.message}` });
  }
};

// Upload thumbnail image specifically
exports.uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const thumbnailPath = req.file.path;
    res.status(200).json({
      message: "Thumbnail uploaded successfully",
      thumbnailPath: thumbnailPath,
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to upload thumbnail: ${error.message}` });
  }
};

// Update formation content (chapters and lessons)
exports.updateFormationContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapters } = req.body;

    const formation = await Formation.findByIdAndUpdate(
      id,
      { content: chapters },
      { new: true, runValidators: true }
    );

    if (!formation) {
      return res.status(404).json({ message: "Formation not found" });
    }

    res.status(200).json({ message: "Formation content updated successfully", formation });
  } catch (error) {
    res.status(500).json({ message: `Failed to update formation content: ${error.message}` });
  }
};


