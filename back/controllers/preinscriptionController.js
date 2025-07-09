// Updated preinscriptionController.js with duplicate prevention logic

const Preinscription = require("../models/preinscription"); // Adjust path as needed
const User = require("../models/User");

// Check if user already has a pre-inscription for a specific formation
const checkExistingPreinscription = async (req, res) => {
  try {
    const { formationId } = req.params;
    const userId = req.user._id;

    const existingPreinscription = await Preinscription.findOne({
      userId: userId,
      'formation.id': formationId
    });

    res.json({
      hasExistingPreinscription: !!existingPreinscription,
      preinscription: existingPreinscription || null
    });
  } catch (error) {
    console.error('Error checking existing pre-inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification de la pré-inscription',
      error: error.message
    });
  }
};

// Create a new pre-inscription (modified to prevent duplicates)
const createPreinscription = async (req, res) => {
  try {
    const { nom, formation } = req.body;
    const userId = req.user._id;
   const userdata=await User.findById(req.user._id)
const {_id, name, lastname, phone, email, codeCin}=userdata
    // Check if user already has a pre-inscription for this formation
    const existingPreinscription = await Preinscription.findOne({
      userId: userId,
      'formation.id': formation.id
    });

    if (existingPreinscription) {
      return res.status(409).json({
        message: 'Vous avez déjà une demande de pré-inscription pour cette formation. Veuillez attendre la confirmation du centre.',
        existingPreinscription: existingPreinscription
      });
    }

    // Create new pre-inscription
    const newPreinscription = new Preinscription({
       userId:_id,
      nom:name,
      prenom:lastname,
      phone,
      email,
      cin:codeCin,
      formation,
    });

    const savedPreinscription = await newPreinscription.save();

    res.status(201).json({
      message: 'Demande de pré-inscription créée avec succès',
      preinscription: savedPreinscription
    });
  } catch (error) {
    console.error('Error creating pre-inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de la création de la pré-inscription',
      error: error.message
    });
  }
};

// Get all pre-inscriptions (admin only)
const getPreinscriptions = async (req, res) => {
  try {
    const preinscriptions = await Preinscription.find()
      .populate('userId', 'name lastname email')
      .sort({ createdAt: -1 });

    res.json(preinscriptions);
  } catch (error) {
    console.error('Error fetching pre-inscriptions:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération des pré-inscriptions',
      error: error.message
    });
  }
};

// Get pre-inscription by ID (admin only)
const getPreinscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const preinscription = await Preinscription.findById(id)
      .populate('userId', 'name lastname email');

    if (!preinscription) {
      return res.status(404).json({
        message: 'Pré-inscription non trouvée'
      });
    }

    res.json(preinscription);
  } catch (error) {
    console.error('Error fetching pre-inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de la récupération de la pré-inscription',
      error: error.message
    });
  }
};

// Update pre-inscription (admin only)
const updatePreinscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPreinscription = await Preinscription.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name lastname email');

    if (!updatedPreinscription) {
      return res.status(404).json({
        message: 'Pré-inscription non trouvée'
      });
    }

    res.json({
      message: 'Pré-inscription mise à jour avec succès',
      preinscription: updatedPreinscription
    });
  } catch (error) {
    console.error('Error updating pre-inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de la mise à jour de la pré-inscription',
      error: error.message
    });
  }
};

// Delete pre-inscription (admin only)
const deletePreinscription = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPreinscription = await Preinscription.findByIdAndDelete(id);

    if (!deletedPreinscription) {
      return res.status(404).json({
        message: 'Pré-inscription non trouvée'
      });
    }

    res.json({
      message: 'Pré-inscription supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting pre-inscription:', error);
    res.status(500).json({
      message: 'Erreur lors de la suppression de la pré-inscription',
      error: error.message
    });
  }
};

module.exports = {
  createPreinscription,
  getPreinscriptions,
  getPreinscriptionById,
  updatePreinscription,
  deletePreinscription,
  checkExistingPreinscription
};

