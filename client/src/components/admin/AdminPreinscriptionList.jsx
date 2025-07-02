import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Search, 
  Eye, 
  Trash2, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  BookOpen,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../../services/api';
import { Label } from 'recharts';

const AdminPreinscriptionList = () => {
  const [preinscriptions, setPreinscriptions] = useState([]);
  const [filteredPreinscriptions, setFilteredPreinscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreinscription, setSelectedPreinscription] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPreinscriptions();
  }, []);

  useEffect(() => {
    filterPreinscriptions();
  }, [preinscriptions, searchTerm]);

  const fetchPreinscriptions = async () => {
    try {
      const response = await api.get('/preinscriptions');
      setPreinscriptions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pre-inscriptions:', error);
      setLoading(false);
    }
  };

  const filterPreinscriptions = () => {
    if (!searchTerm) {
      setFilteredPreinscriptions(preinscriptions);
      return;
    }

    const filtered = preinscriptions.filter(preinscription =>
      preinscription.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preinscription.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preinscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      preinscription.formation.titre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPreinscriptions(filtered);
  };

  const handleViewDetails = (preinscription) => {
    setSelectedPreinscription(preinscription);
    setShowDetails(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette pré-inscription ?')) {
      return;
    }

    try {
      await api.delete(`/preinscriptions/${id}`);
      setPreinscriptions(prev => prev.filter(p => p._id !== id));
      alert('Pré-inscription supprimée avec succès');
    } catch (error) {
      console.error('Error deleting pre-inscription:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-6 w-6 mr-2" />
            Gestion des Pré-inscriptions
          </CardTitle>
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher par nom, email ou formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">
              {filteredPreinscriptions.length} pré-inscription{filteredPreinscriptions.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {filteredPreinscriptions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune pré-inscription trouvée
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Essayez de modifier votre recherche.' : 'Aucune pré-inscription n\'a été soumise pour le moment.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidat</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreinscriptions.map((preinscription) => (
                    <TableRow key={preinscription._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {preinscription.prenom} {preinscription.nom}
                            </div>
                            <div className="text-sm text-gray-500">
                              CIN: {preinscription.cin}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {preinscription.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {preinscription.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">
                          {preinscription.formation.titre}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(preinscription.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                         
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(preinscription._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetails && selectedPreinscription && (
        <PreinscriptionDetailsModal
          preinscription={selectedPreinscription}
          onClose={() => {
            setShowDetails(false);
            setSelectedPreinscription(null);
          }}
          onUpdate={(updatedPreinscription) => {
            setPreinscriptions(prev =>
              prev.map(p => p._id === updatedPreinscription._id ? updatedPreinscription : p)
            );
          }}
        />
      )}
    </div>
  );
};

// Details Modal Component
const PreinscriptionDetailsModal = ({ preinscription, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: preinscription.nom,
    prenom: preinscription.prenom,
    phone: preinscription.phone,
    email: preinscription.email,
    cin: preinscription.cin,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/preinscriptions/${preinscription._id}`, formData);
      onUpdate(response.data.preinscription);
      setIsEditing(false);
      alert('Pré-inscription mise à jour avec succès');
    } catch (error) {
      console.error('Error updating pre-inscription:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Détails de la Pré-inscription</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Formation Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Formation</h3>
            <p className="text-blue-800">{preinscription.formation.titre}</p>
            <p className="text-sm text-blue-600 mt-1">
              Soumise le {formatDate(preinscription.createdAt)}
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              {isEditing ? (
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{preinscription.nom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              {isEditing ? (
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{preinscription.prenom}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{preinscription.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{preinscription.phone}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cin">CIN</Label>
              {isEditing ? (
                <Input
                  id="cin"
                  name="cin"
                  value={formData.cin}
                  onChange={handleInputChange}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{preinscription.cin}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nom: preinscription.nom,
                      prenom: preinscription.prenom,
                      phone: preinscription.phone,
                      email: preinscription.email,
                      cin: preinscription.cin,
                    });
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleUpdate} disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Sauvegarder'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPreinscriptionList;

