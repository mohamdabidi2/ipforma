const mongoose = require("mongoose");

const preinscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cin: {
    type: String,
    required: true,
  },
  formation: {
    titre: { type: String, required: true },
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Formation", required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Preinscription", preinscriptionSchema);


