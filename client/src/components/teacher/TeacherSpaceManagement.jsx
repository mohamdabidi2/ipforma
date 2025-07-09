import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Upload,
  FileText,
  File,
  Link,
  Lock,
  Unlock,
  Users,
  Download,
  Copy,
  Calendar,
  Clock,
  Shield,
  Activity,
  ExternalLink,
  FolderOpen,
  Settings,
  Share2,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  CloudUpload,
  Paperclip,
  Globe,
  LinkIcon,
  FileIcon,
  Loader2,
  ZoomIn
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherSpaceManagement = () => {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [formations, setFormations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [spaceForm, setSpaceForm] = useState({
    title: '',
    description: '',
    password: '',
    formation: '',
    isActive: true,
    allowDownload: true,
    expiryDate: '',
    students: []
  });

  const [contentForm, setContentForm] = useState({
    files: [],
    links: [],
    documents: []
  });

  const [fileUploadForm, setFileUploadForm] = useState({
    files: [],
    category: 'document', // document, other
    description: ''
  });

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    description: '',
    category: 'general' // general, resource, assignment, reference
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchSpaceData();
  }, []);

  const fetchSpaceData = async () => {
    try {
      setLoading(true);

      // Fetch teacher spaces
      const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);

      // Fetch formations
      const formationsResponse = await api.get('/formations');
      setFormations(Array.isArray(formationsResponse.data) ? formationsResponse.data : []);

      // Fetch students
      const studentsResponse = await api.get('/users?role=student');
      setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching space data:', error);
      setLoading(false);
    }
  };

  const handleCreateSpace = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/teacher-spaces', {
        ...spaceForm,
        teacherId: user._id
      });
      
      // Fetch updated data
      const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
      
      setShowCreateModal(false);
      resetSpaceForm();
      alert('Espace créé avec succès');
    } catch (error) {
      console.error('Error creating space:', error);
      alert('Erreur lors de la création de l\'espace');
    }
  };

  const handleEditSpace = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/teacher-spaces/${selectedSpace._id}`, spaceForm);
      
      // Fetch updated data
      const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
      
      setShowEditModal(false);
      resetSpaceForm();
      alert('Espace modifié avec succès');
    } catch (error) {
      console.error('Error updating space:', error);
      alert('Erreur lors de la modification de l\'espace');
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet espace ?')) {
      try {
        await api.delete(`/teacher-spaces/${spaceId}`);
        
        // Fetch updated data
        const spacesResponse = await api.get('/teacher-spaces/my-spaces');
        setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
        
        alert('Espace supprimé avec succès');
      } catch (error) {
        console.error('Error deleting space:', error);
        alert('Erreur lors de la suppression de l\'espace');
      }
    }
  };

  // Enhanced File Upload Handler
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedSpace || fileUploadForm.files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      fileUploadForm.files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', fileUploadForm.category);
      formData.append('description', fileUploadForm.description);

      const response = await api.post(`/teacher-spaces/${selectedSpace._id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);

      setShowFileUploadModal(false);
      setFileUploadForm({ files: [], category: 'document', description: '' });
      setUploadProgress(0);
      alert('Fichier(s) uploadé(s) avec succès');
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Erreur lors de l\'upload des fichiers');
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced Link Management
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!selectedSpace || !linkForm.url) return;

    try {
      const response = await api.post(`/teacher-spaces/${selectedSpace._id}/add-link`, linkForm);
      
          const spacesResponse = await api.get('/teacher-spaces/my-spaces');
        setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);

      setShowLinkModal(false);
      setLinkForm({ title: '', url: '', description: '', category: 'general' });
      alert('Lien ajouté avec succès');
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Erreur lors de l\'ajout du lien');
    }
  };

  const handleRemoveFile = async (spaceId, fileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      try {
        const response = await api.delete(`/teacher-spaces/${spaceId}/files/${fileId}`);
         const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
        
        // Close the content modal after deletion
        setShowContentModal(false);
        
        alert('Fichier supprimé avec succès');
      } catch (error) {
        console.error('Error removing file:', error);
        alert('Erreur lors de la suppression du fichier');
      }
    }
  };

  const handleRemoveLink = async (spaceId, linkId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      try {
        const response = await api.delete(`/teacher-spaces/${spaceId}/links/${linkId}`);
         const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
        
        // Close the content modal after deletion
        setShowContentModal(false);
        
        alert('Lien supprimé avec succès');
      } catch (error) {
        console.error('Error removing link:', error);
        alert('Erreur lors de la suppression du lien');
      }
    }
  };

  // Document viewing and downloading functions
  const handleViewDocument = async (document) => {
    try {
      setSelectedDocument(document);
      setShowDocumentViewer(true);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Erreur lors de l\'ouverture du document');
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const response = await api.get(`/teacher-spaces/files/${document._id}/download`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Téléchargement démarré');
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleDownloadAllFiles = async (spaceId) => {
    try {
      const response = await api.get(`/teacher-spaces/${spaceId}/download-all`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `space-${spaceId}-files.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Téléchargement de tous les fichiers démarré');
    } catch (error) {
      console.error('Error downloading all files:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFileUploadForm(prev => ({
        ...prev,
        files: [...prev.files, ...droppedFiles]
      }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFileUploadForm(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));
    }
  };

  const removeSelectedFile = (index) => {
    setFileUploadForm(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleToggleSpaceStatus = async (spaceId, isActive) => {
    try {
      await api.put(`/teacher-spaces/${spaceId}`, { isActive });
      
      // Fetch updated data
      const spacesResponse = await api.get('/teacher-spaces/my-spaces');
      setSpaces(Array.isArray(spacesResponse.data) ? spacesResponse.data : []);
      
    } catch (error) {
      console.error('Error toggling space status:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const openEditModal = (space) => {
    setSelectedSpace(space);
    setSpaceForm({
      title: space.title,
      description: space.description,
      password: space.password,
      formation: space.formation?._id || '',
      isActive: space.isActive,
      allowDownload: space.allowDownload,
      expiryDate: space.expiryDate ? space.expiryDate.split('T')[0] : '',
      students: space.students?.map(s => s._id || s) || []
    });
    setShowEditModal(true);
  };

  const openContentModal = async (space) => {
    setSelectedSpace(space);
    try {
      const response = await api.get(`/teacher-spaces/${space._id}/content`);
      console.log(response.data.data)
      setContentForm({ files: response.data.data.files || [], links: response.data.data.links || [] });
    } catch (error) {
      console.error('Error fetching content:', error);
      setContentForm({ files: [], links: [], documents: [] });
    }
    setShowContentModal(true);
  };

  const openFileUploadModal = (space) => {
    setSelectedSpace(space);
    setFileUploadForm({ files: [], category: 'document', description: '' });
    setShowFileUploadModal(true);
  };

  const openLinkModal = (space) => {
    setSelectedSpace(space);
    setLinkForm({ title: '', url: '', description: '', category: 'general' });
    setShowLinkModal(true);
  };

  const resetSpaceForm = () => {
    setSpaceForm({
      title: '',
      description: '',
      password: '',
      formation: '',
      isActive: true,
      allowDownload: true,
      expiryDate: '',
      students: []
    });
    setSelectedSpace(null);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSpaceForm({ ...spaceForm, password });
  };

  const copyPassword = (password) => {
    navigator.clipboard.writeText(password);
    alert('Mot de passe copié dans le presse-papiers');
  };

  const copySpaceLink = (spaceId) => {
    const link = `${window.location.origin}/student/space/${spaceId}`;
    navigator.clipboard.writeText(link);
    alert('Lien de l\'espace copié dans le presse-papiers');
  };

  const filteredSpaces = spaces.filter(space =>
    space.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'doc':
      case 'docx': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'txt': return <FileText className="h-4 w-4 text-gray-600" />;
      case 'zip':
      case 'rar':
      case '7z': return <File className="h-4 w-4 text-orange-600" />;
      case 'ppt':
      case 'pptx': return <FileText className="h-4 w-4 text-orange-600" />;
      case 'xls':
      case 'xlsx': return <FileText className="h-4 w-4 text-green-600" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSpaceStatusColor = (space) => {
    if (!space.isActive) return 'bg-red-100 text-red-800';
    
    const now = new Date();
    const expiryDate = space.expiryDate ? new Date(space.expiryDate) : null;
    
    if (expiryDate && now > expiryDate) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getSpaceStatusText = (space) => {
    if (!space.isActive) return 'Inactif';
    
    const now = new Date();
    const expiryDate = space.expiryDate ? new Date(space.expiryDate) : null;
    
    if (expiryDate && now > expiryDate) return 'Expiré';
    return 'Actif';
  };

  const getSpaceStatusIcon = (space) => {
    if (!space.isActive) return <XCircle className="h-4 w-4" />;
    
    const now = new Date();
    const expiryDate = space.expiryDate ? new Date(space.expiryDate) : null;
    
    if (expiryDate && now > expiryDate) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDocumentViewable = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return ['pdf', 'txt', 'doc', 'docx'].includes(extension);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes espaces de cours</h2>
          <p className="text-gray-600 mt-1">Gérez vos espaces de partage et leurs contenus</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des espaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 focus:ring-0 bg-transparent"
            />
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel espace
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouvel espace</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSpace} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Titre de l'espace *</Label>
                    <Input
                      id="title"
                      value={spaceForm.title}
                      onChange={(e) => setSpaceForm({ ...spaceForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="formation">Formation</Label>
                    <Select value={spaceForm.formation} onValueChange={(value) => setSpaceForm({ ...spaceForm, formation: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une formation" />
                      </SelectTrigger>
                      <SelectContent>
                        {formations.map(formation => (
                          <SelectItem key={formation._id} value={formation._id}>
                            {formation.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={spaceForm.description}
                    onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Mot de passe d'accès</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="password"
                        type="text"
                        value={spaceForm.password}
                        onChange={(e) => setSpaceForm({ ...spaceForm, password: e.target.value })}
                        placeholder="Générer ou saisir un mot de passe"
                      />
                      <Button type="button" onClick={generatePassword} variant="outline">
                        Générer
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Date d'expiration</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={spaceForm.expiryDate}
                      onChange={(e) => setSpaceForm({ ...spaceForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={spaceForm.isActive}
                      onCheckedChange={(checked) => setSpaceForm({ ...spaceForm, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Espace actif</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowDownload"
                      checked={spaceForm.allowDownload}
                      onCheckedChange={(checked) => setSpaceForm({ ...spaceForm, allowDownload: checked })}
                    />
                    <Label htmlFor="allowDownload">Autoriser le téléchargement</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Créer l'espace
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Spaces Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Espace
                </th>
           
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contenu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mot de passe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpaces.map((space) => (
                <tr key={space._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {space.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {space.description || 'Aucune description'}
                      </div>
                    </div>
                  </td>
               
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getSpaceStatusColor(space)}>
                      <div className="flex items-center space-x-1">
                        {getSpaceStatusIcon(space)}
                        <span>{getSpaceStatusText(space)}</span>
                      </div>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{space.students?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-1" />
                        <span>{space.files?.length || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <Link className="h-4 w-4 mr-1" />
                        <span>{space.links?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {space.password ? (
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {space.password}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyPassword(space.password)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Non défini</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(space.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openContentModal(space)}
                        title="Voir le contenu"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(space)}
                        title="Modifier"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openFileUploadModal(space)}
                        title="Ajouter des fichiers"
                        className="h-8 w-8 p-0"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openLinkModal(space)}
                        title="Ajouter un lien"
                        className="h-8 w-8 p-0"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleSpaceStatus(space._id, !space.isActive)}
                        title={space.isActive ? 'Désactiver' : 'Activer'}
                        className="h-8 w-8 p-0"
                      >
                        {space.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSpace(space._id)}
                        title="Supprimer"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun espace trouvé' : 'Aucun espace créé'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Essayez de modifier votre recherche'
              : 'Commencez par créer votre premier espace de cours'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer un espace
            </Button>
          )}
        </div>
      )}

      {/* Edit Space Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'espace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSpace} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Titre de l'espace *</Label>
                <Input
                  id="edit-title"
                  value={spaceForm.title}
                  onChange={(e) => setSpaceForm({ ...spaceForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-formation">Formation</Label>
                <Select value={spaceForm.formation} onValueChange={(value) => setSpaceForm({ ...spaceForm, formation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {formations.map(formation => (
                      <SelectItem key={formation._id} value={formation._id}>
                        {formation.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={spaceForm.description}
                onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-password">Mot de passe d'accès</Label>
                <div className="flex space-x-2">
                  <Input
                    id="edit-password"
                    type="text"
                    value={spaceForm.password}
                    onChange={(e) => setSpaceForm({ ...spaceForm, password: e.target.value })}
                    placeholder="Générer ou saisir un mot de passe"
                  />
                  <Button type="button" onClick={generatePassword} variant="outline">
                    Générer
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-expiryDate">Date d'expiration</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={spaceForm.expiryDate}
                  onChange={(e) => setSpaceForm({ ...spaceForm, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={spaceForm.isActive}
                  onCheckedChange={(checked) => setSpaceForm({ ...spaceForm, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Espace actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-allowDownload"
                  checked={spaceForm.allowDownload}
                  onCheckedChange={(checked) => setSpaceForm({ ...spaceForm, allowDownload: checked })}
                />
                <Label htmlFor="edit-allowDownload">Autoriser le téléchargement</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Sauvegarder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Contenu de l'espace: {selectedSpace?.title}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">
                <File className="h-4 w-4 mr-2" />
                Documents ({contentForm.files?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="links">
                <Link className="h-4 w-4 mr-2" />
                Liens ({contentForm.links?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documents</h3>
                <div className="flex space-x-2">
                  <Button onClick={() => openFileUploadModal(selectedSpace)} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter des documents
                  </Button>
                  
                </div>
              </div>
              
              {contentForm.files && contentForm.files.length > 0 ? (
                <div className="grid gap-3">
                  {contentForm.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                          </p>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                    
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => window.open(file.url, '_blank')}
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveFile(selectedSpace._id, file._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <File className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun document dans cet espace</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="links" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Liens</h3>
                <Button onClick={() => openLinkModal(selectedSpace)} size="sm">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Ajouter un lien
                </Button>
              </div>
              
              {contentForm.links && contentForm.links.length > 0 ? (
                <div className="grid gap-3">
                  {contentForm.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{link.title}</p>
                          <p className="text-sm text-blue-600 hover:underline">
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                              {link.url}
                            </a>
                          </p>
                          {link.description && (
                            <p className="text-sm text-gray-500">{link.description}</p>
                          )}
                          <Badge variant="outline" className="text-xs mt-1">
                            {link.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" asChild>
                          <a href={link.url} target="_blank" rel="noopener noreferrer" title="Ouvrir le lien">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveLink(selectedSpace._id, link._id)}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Aucun lien dans cet espace</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <Dialog open={showDocumentViewer} onOpenChange={setShowDocumentViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Aperçu du document: {selectedDocument?.name}</span>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownloadDocument(selectedDocument)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowDocumentViewer(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="w-full h-96 border rounded-lg overflow-hidden">
            {selectedDocument && (
              <>
                {selectedDocument.name.toLowerCase().endsWith('.pdf') && (
                  <iframe
                    src={`/api/teacher-spaces/files/${selectedDocument._id}/view`}
                    className="w-full h-full"
                    title="Document PDF"
                  />
                )}
                {(selectedDocument.name.toLowerCase().endsWith('.txt') || 
                  selectedDocument.name.toLowerCase().endsWith('.doc') || 
                  selectedDocument.name.toLowerCase().endsWith('.docx')) && (
                  <div className="p-4 h-full overflow-y-auto bg-white">
                    <p className="text-gray-600">
                      Aperçu du document disponible. Téléchargez le fichier pour une visualisation complète.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={showFileUploadModal} onOpenChange={setShowFileUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter des documents</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFileUpload} className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez-déposez vos documents ici
              </p>
              <p className="text-gray-600 mb-4">ou</p>
              <Button type="button" variant="outline" onClick={() => document.getElementById('file-input').click()}>
                <Paperclip className="h-4 w-4 mr-2" />
                Sélectionner des documents
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Formats supportés: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP, RAR
              </p>
            </div>

            {/* Selected Files */}
            {fileUploadForm.files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Documents sélectionnés:</h4>
                {fileUploadForm.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.name)}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSelectedFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="file-description">Description (optionnel)</Label>
              <Textarea
                id="file-description"
                value={fileUploadForm.description}
                onChange={(e) => setFileUploadForm({ ...fileUploadForm, description: e.target.value })}
                rows={2}
                placeholder="Description des documents..."
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upload en cours...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowFileUploadModal(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={fileUploadForm.files.length === 0 || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Uploader
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un lien</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddLink} className="space-y-4">
            <div>
              <Label htmlFor="link-title">Titre du lien *</Label>
              <Input
                id="link-title"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                required
                placeholder="Titre descriptif du lien"
              />
            </div>

            <div>
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                type="url"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                required
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="link-description">Description</Label>
              <Textarea
                id="link-description"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                rows={2}
                placeholder="Description du lien..."
              />
            </div>

            <div>
              <Label htmlFor="link-category">Catégorie</Label>
              <Select value={linkForm.category} onValueChange={(value) => setLinkForm({ ...linkForm, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Général</SelectItem>
                  <SelectItem value="resource">Ressource</SelectItem>
                  <SelectItem value="assignment">Devoir</SelectItem>
                  <SelectItem value="reference">Référence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowLinkModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <LinkIcon className="h-4 w-4 mr-2" />
                Ajouter le lien
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherSpaceManagement;

