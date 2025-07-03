import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Upload,
  FileText,
  Image,
  Video,
  File,
  Download,
  Link,
  ChevronDown,
  ChevronRight,
  Settings,
  Filter,
  Grid,
  List,
  Save,
  X,
  Copy,
  Move,
  FolderPlus,
  Tag,
  Clock,
  Users,
  Star,
  TrendingUp,
  ImageIcon,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Target,
  Award,
  Bookmark,
  UserPlus,
  Building,
  User
} from 'lucide-react';
import api from '../../services/api';

const AdminFormationManagement = () => {
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Predefined categories with prefixes
  const predefinedCategories = [
    { id: 'tech', name: 'Technologie', prefix: 'TECH', color: 'bg-blue-500', icon: '💻' },
    { id: 'business', name: 'Business', prefix: 'BIZ', color: 'bg-green-500', icon: '💼' },
    { id: 'design', name: 'Design', prefix: 'DES', color: 'bg-purple-500', icon: '🎨' },
    { id: 'marketing', name: 'Marketing', prefix: 'MKT', color: 'bg-orange-500', icon: '📈' },
    { id: 'language', name: 'Langues', prefix: 'LANG', color: 'bg-red-500', icon: '🌍' },
    { id: 'health', name: 'Santé', prefix: 'HLTH', color: 'bg-teal-500', icon: '🏥' },
    { id: 'finance', name: 'Finance', prefix: 'FIN', color: 'bg-yellow-500', icon: '💰' },
    { id: 'education', name: 'Éducation', prefix: 'EDU', color: 'bg-indigo-500', icon: '📚' },
    { id: 'security', name: 'Sécurité au travail', prefix: 'SEC', color: 'bg-red-600', icon: '🛡️' },
    { id: 'other', name: 'Autre', prefix: 'OTHR', color: 'bg-gray-500', icon: '❓' }
  ];
  
  const [formationForm, setFormationForm] = useState({
    title: '',
    description: '',
    price: '',
    durationWeeks: '',
    estimatedHours: '',
    type: 'sociétés', // Changed default to 'sociétés'
    category: '',
    categoryPrefix: '',
    level: 'intermediate',
    maxStudents: '',
    prerequisites: '',
    objectives: '',
    isActive: true,
    tags: [],
    thumbnail: '',
    difficulty: 3,
    formationCode: ''
  });

  const [contentForm, setContentForm] = useState({
    content: [
      {
        id: 1,
        title: '',
        description: '',
        order: 1,
        lessons: [
          {
            id: 1,
            title: '',
            content: '',
            type: 'text',
            order: 1,
            isCompleted: false,
            resources: []
          }
        ]
      }
    ]
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    prefix: '',
    color: 'bg-blue-500',
    icon: '📚',
    description: ''
  });

  useEffect(() => {
    fetchFormations();
    fetchCategories();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/formations');
      setFormations(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching formations:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories([...predefinedCategories, ...(Array.isArray(response.data) ? response.data : [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(predefinedCategories);
    }
  };

  // Image upload functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('thumbnail', selectedImage);

      const response = await api.post('/formations/upload-thumbnail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      return response.data.thumbnailPath;
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploading(false);
      alert('Erreur lors du téléchargement de l\'image');
      return null;
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormationForm({ ...formationForm, thumbnail: '' });
  };

  const generateFormationCode = (categoryPrefix) => {
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryPrefix || 'GEN'}-${timestamp}`;
  };

  const handleCreateFormation = async (e) => {
    e.preventDefault();
    try {
      let thumbnailPath = formationForm.thumbnail;
      
      // Upload image if selected
      if (selectedImage) {
        thumbnailPath = await uploadImage();
        if (!thumbnailPath) return; // Stop if upload failed
      }

      const selectedCat = categories.find(cat => cat.id === formationForm.category);
      const formationCode = generateFormationCode(selectedCat?.prefix);
      
      const formationData = {
        ...formationForm,
        thumbnail: thumbnailPath,
        categoryPrefix: selectedCat?.prefix || 'GEN',
        formationCode: formationCode,
        tags: Array.isArray(formationForm.tags) ? formationForm.tags : [],
        price: parseFloat(formationForm.price) || 0,
        durationWeeks: parseInt(formationForm.durationWeeks) || 1,
        maxStudents: parseInt(formationForm.maxStudents) || 20,
        difficulty: parseInt(formationForm.difficulty) || 3
      };
      
      const response = await api.post('/formations', formationData);
      setFormations([...formations, response.data]);
      setShowCreateModal(false);
      resetForm();
      alert('Formation créée avec succès');
    } catch (error) {
      console.error('Error creating formation:', error);
      alert('Erreur lors de la création de la formation');
    }
  };

  const handleEditFormation = async (e) => {
    e.preventDefault();
    try {
      let thumbnailPath = formationForm.thumbnail;
      
      // Upload new image if selected
      if (selectedImage) {
        thumbnailPath = await uploadImage();
        if (!thumbnailPath) return; // Stop if upload failed
      }

      const updatedFormationData = {
        ...formationForm,
        thumbnail: thumbnailPath,
        tags: Array.isArray(formationForm.tags) ? formationForm.tags : [],
        price: parseFloat(formationForm.price) || 0,
        durationWeeks: parseInt(formationForm.durationWeeks) || 1,
        maxStudents: parseInt(formationForm.maxStudents) || 20,
        difficulty: parseInt(formationForm.difficulty) || 3
      };

      const response = await api.put(`/formations/${selectedFormation._id}`, updatedFormationData);
      setFormations(formations.map(formation => 
        formation._id === selectedFormation._id ? response.data : formation
      ));
      setShowEditModal(false);
      resetForm();
      alert('Formation modifiée avec succès');
    } catch (error) {
      console.error('Error updating formation:', error);
      alert('Erreur lors de la modification de la formation');
    }
  };

  const handleDeleteFormation = async (formationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await api.delete(`/formations/${formationId}`);
        setFormations(formations.filter(formation => formation._id !== formationId));
        alert('Formation supprimée avec succès');
      } catch (error) {
        console.error('Error deleting formation:', error);
        alert('Erreur lors de la suppression de la formation');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.length} formation(s) ?`)) {
      try {
        await Promise.all(selectedRows.map(id => api.delete(`/formations/${id}`)));
        setFormations(formations.filter(formation => !selectedRows.includes(formation._id)));
        setSelectedRows([]);
        alert('Formations supprimées avec succès');
      } catch (error) {
        console.error('Error deleting formations:', error);
        alert('Erreur lors de la suppression des formations');
      }
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    try {
      const contentData = {
        content: contentForm.content.map((module, index) => ({
          ...module,
          order: index + 1,
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            ...lesson,
            order: lessonIndex + 1
          }))
        }))
      };
      
      await api.put(`/formations/${selectedFormation._id}/content`, contentData);
      setShowContentModal(false);
      alert('Contenu mis à jour avec succès');
      fetchFormations(); // Refresh formations to get updated content
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Erreur lors de la mise à jour du contenu');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/categories', categoryForm);
      setCategories([...categories, response.data]);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', prefix: '', color: 'bg-blue-500', icon: '📚', description: '' });
      alert('Catégorie créée avec succès');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const openEditModal = (formation) => {
    setSelectedFormation(formation);
    setFormationForm({
      title: formation.title || '',
      description: formation.description || '',
      price: formation.price || '',
      durationWeeks: formation.durationWeeks || '',
      estimatedHours: formation.estimatedHours || '',
      type: formation.type || 'sociétés',
      category: formation.category || '',
      categoryPrefix: formation.categoryPrefix || '',
      level: formation.level || 'intermediate',
      maxStudents: formation.maxStudents || '',
      prerequisites: formation.prerequisites || '',
      objectives: formation.objectives || '',
      isActive: formation.isActive !== false,
      tags: formation.tags || [],
      thumbnail: formation.thumbnail || '',
      difficulty: formation.difficulty || 3,
      formationCode: formation.formationCode || ''
    });
    
    // Set image preview if thumbnail exists
    if (formation.thumbnail) {
      setImagePreview(formation.thumbnail);
    }
    
    setShowEditModal(true);
  };

  const openContentModal = (formation) => {
    setSelectedFormation(formation);
    // Use the content directly from the formation object if it exists, otherwise initialize with default structure
    setContentForm({ 
      content: formation.content && formation.content.length > 0 ? formation.content : [
        {
          id: 1,
          title: '',
          description: '',
          order: 1,
          lessons: [
            {
              id: 1,
              title: '',
              content: '',
              type: 'text',
              order: 1,
              isCompleted: false,
              resources: []
            }
          ]
        }
      ]
    });
    setShowContentModal(true);
  };

  const resetForm = () => {
    setFormationForm({
      title: '',
      description: '',
      price: '',
      durationWeeks: '',
      estimatedHours: '',
      type: 'sociétés',
      category: '',
      categoryPrefix: '',
      level: 'intermediate',
      maxStudents: '',
      prerequisites: '',
      objectives: '',
      isActive: true,
      tags: [],
      thumbnail: '',
      difficulty: 3,
      formationCode: ''
    });
    setSelectedFormation(null);
    setSelectedImage(null);
    setImagePreview('');
  };

  // Enhanced content management functions
  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: '',
      description: '',
      order: contentForm.content.length + 1,
      lessons: [{
        id: Date.now() + 1,
        title: '',
        content: '',
        type: 'text',
        order: 1,
        isCompleted: false,
        resources: []
      }]
    };
    setContentForm({
      ...contentForm,
      content: [...contentForm.content, newModule]
    });
  };

  const addLesson = (moduleIndex) => {
    const updatedContent = [...contentForm.content];
    const newLesson = {
      id: Date.now(),
      title: '',
      content: '',
      type: 'text',
      order: updatedContent[moduleIndex].lessons.length + 1,
      isCompleted: false,
      resources: []
    };
    updatedContent[moduleIndex].lessons.push(newLesson);
    setContentForm({ ...contentForm, content: updatedContent });
  };

  const updateModule = (moduleIndex, field, value) => {
    const updatedContent = [...contentForm.content];
    updatedContent[moduleIndex][field] = value;
    setContentForm({ ...contentForm, content: updatedContent });
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const updatedContent = [...contentForm.content];
    updatedContent[moduleIndex].lessons[lessonIndex][field] = value;
    setContentForm({ ...contentForm, content: updatedContent });
  };

  const removeModule = (moduleIndex) => {
    const updatedContent = contentForm.content.filter((_, index) => index !== moduleIndex);
    setContentForm({ ...contentForm, content: updatedContent });
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const updatedContent = [...contentForm.content];
    updatedContent[moduleIndex].lessons = updatedContent[moduleIndex].lessons.filter((_, index) => index !== lessonIndex);
    setContentForm({ ...contentForm, content: updatedContent });
  };

  const toggleModuleExpansion = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const duplicateModule = (moduleIndex) => {
    const moduleToDuplicate = { ...contentForm.content[moduleIndex] };
    moduleToDuplicate.id = Date.now();
    moduleToDuplicate.title = `${moduleToDuplicate.title} (Copie)`;
    moduleToDuplicate.order = contentForm.content.length + 1;
    moduleToDuplicate.lessons = moduleToDuplicate.lessons.map(lesson => ({
      ...lesson,
      id: Date.now() + Math.random()
    }));
    
    setContentForm({
      ...contentForm,
      content: [...contentForm.content, moduleToDuplicate]
    });
  };

  // Sorting and filtering functions
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedFormations = formations
    .filter(formation => {
      const matchesSearch = formation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           formation.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           formation.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || formation.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFormations.length / itemsPerPage);
  const paginatedFormations = filteredAndSortedFormations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, prefix: 'GEN', color: 'bg-gray-500', icon: '📚' };
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sociétés': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'passagers': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sociétés': return <Building className="h-4 w-4 mr-1" />;
      case 'passagers': return <User className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-600" />;
      case 'document': return <FileText className="h-4 w-4 text-red-600" />;
      case 'link': return <Link className="h-4 w-4 text-green-600" />;
      case 'image': return <Image className="h-4 w-4 text-purple-600" />;
      case 'quiz': return <Star className="h-4 w-4 text-yellow-600" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyStars = (difficulty) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(paginatedFormations.map(f => f._id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (formationId, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, formationId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== formationId));
    }
  };

  // Image Upload Component
  const ImageUploadComponent = ({ isEdit = false }) => (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Image de couverture</Label>
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Upload Area */}
      {!imagePreview && (
        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            id={isEdit ? "edit-image-upload" : "image-upload"}
          />
          <label 
            htmlFor={isEdit ? "edit-image-upload" : "image-upload"} 
            className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">Cliquez pour sélectionner une image</p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF jusqu'à 10MB</p>
          </label>
        </div>
      )}
      
      {/* Manual URL Input */}
      <div>
        <Label htmlFor="thumbnail-url" className="text-sm font-medium">Ou entrez une URL d'image</Label>
        <Input
          id="thumbnail-url"
          value={formationForm.thumbnail}
          onChange={(e) => {
            setFormationForm({ ...formationForm, thumbnail: e.target.value });
            if (e.target.value) {
              setImagePreview(e.target.value);
              setSelectedImage(null);
            }
          }}
          className="mt-1 h-12"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gestion des Formations</h2>
        
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher des formations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Formation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Créer une nouvelle formation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateFormation} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">Titre de la formation</Label>
                    <Input
                      id="title"
                      value={formationForm.title}
                      onChange={(e) => setFormationForm({ ...formationForm, title: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="Ex: Travail en Hauteur"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium">Catégorie</Label>
                    <Select value={formationForm.category} onValueChange={(value) => setFormationForm({ ...formationForm, category: value })}>
                      <SelectTrigger className="mt-1 h-12">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                              <Badge className={`${category.color} text-white text-xs`}>
                                {category.prefix}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formationForm.description}
                    onChange={(e) => setFormationForm({ ...formationForm, description: e.target.value })}
                    rows={4}
                    className="mt-1"
                    placeholder="Formation sur la prévention des risques liés aux travaux en hauteur..."
                    required
                  />
                </div>
                
                {/* Image Upload Component */}
                <ImageUploadComponent />
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium">Prix (DT)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formationForm.price}
                      onChange={(e) => setFormationForm({ ...formationForm, price: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="durationWeeks" className="text-sm font-medium">Durée (semaines)</Label>
                    <Input
                      id="durationWeeks"
                      type="number"
                      value={formationForm.durationWeeks}
                      onChange={(e) => setFormationForm({ ...formationForm, durationWeeks: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours" className="text-sm font-medium">Heures estimées</Label>
                    <Input
                      id="estimatedHours"
                      value={formationForm.estimatedHours}
                      onChange={(e) => setFormationForm({ ...formationForm, estimatedHours: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="12h"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStudents" className="text-sm font-medium">Max étudiants</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={formationForm.maxStudents}
                      onChange={(e) => setFormationForm({ ...formationForm, maxStudents: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium">Type de formation</Label>
                    <Select value={formationForm.type} onValueChange={(value) => setFormationForm({ ...formationForm, type: value })}>
                      <SelectTrigger className="mt-1 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sociétés">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            Sociétés
                          </div>
                        </SelectItem>
                        <SelectItem value="passagers">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Passagers
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="level" className="text-sm font-medium">Niveau</Label>
                    <Select value={formationForm.level} onValueChange={(value) => setFormationForm({ ...formationForm, level: value })}>
                      <SelectTrigger className="mt-1 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulté (1-5)</Label>
                    <Select value={formationForm.difficulty.toString()} onValueChange={(value) => setFormationForm({ ...formationForm, difficulty: parseInt(value) })}>
                      <SelectTrigger className="mt-1 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Très facile</SelectItem>
                        <SelectItem value="2">2 - Facile</SelectItem>
                        <SelectItem value="3">3 - Moyen</SelectItem>
                        <SelectItem value="4">4 - Difficile</SelectItem>
                        <SelectItem value="5">5 - Très difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="prerequisites" className="text-sm font-medium">Prérequis</Label>
                    <Textarea
                      id="prerequisites"
                      value={formationForm.prerequisites}
                      onChange={(e) => setFormationForm({ ...formationForm, prerequisites: e.target.value })}
                      rows={3}
                      className="mt-1"
                      placeholder="Aucune ou listez les prérequis nécessaires..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="objectives" className="text-sm font-medium">Objectifs</Label>
                    <Textarea
                      id="objectives"
                      value={formationForm.objectives}
                      onChange={(e) => setFormationForm({ ...formationForm, objectives: e.target.value })}
                      rows={3}
                      className="mt-1"
                      placeholder="Repérer les risques, appliquer les procédures..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    {uploading ? 'Téléchargement...' : 'Créer la Formation'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Formations
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Formations Sociétés
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formations.filter(f => f.type === 'sociétés').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Formations Passagers
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formations.filter(f => f.type === 'passagers').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prix Moyen
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formations.length > 0 
                ? Math.round(formations.reduce((sum, f) => sum + (parseFloat(f.price) || 0), 0) / formations.length)
                : 0
              } DT
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedFormations.length && paginatedFormations.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('title')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Formation
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('category')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Catégorie
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('type')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('level')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Niveau
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('price')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Prix
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedFormations.map((formation) => {
                  const categoryInfo = getCategoryInfo(formation.category);
                  return (
                    <tr key={formation._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(formation._id)}
                          onChange={(e) => handleSelectRow(formation._id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {formation.thumbnail ? (
                              <img 
                                className="h-10 w-10 rounded-lg object-cover" 
                                src={formation.thumbnail} 
                                alt={formation.title} 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formation.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formation.formationCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${categoryInfo.color} text-white`}>
                          <span className="mr-1">{categoryInfo.icon}</span>
                          {categoryInfo.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getTypeColor(formation.type)}>
                          {getTypeIcon(formation.type)}
                          {formation.type === 'sociétés' ? 'Sociétés' : 
                           formation.type === 'passagers' ? 'Passagers' : formation.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getLevelColor(formation.level)}>
                          {formation.level === 'beginner' ? 'Débutant' :
                           formation.level === 'intermediate' ? 'Intermédiaire' :
                           formation.level === 'advanced' ? 'Avancé' : formation.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formation.price === 0 ? 'Gratuit' : `${formation.price} DT`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getDifficultyStars(formation.difficulty || 3)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={formation.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {formation.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openContentModal(formation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(formation)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFormation(formation._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Modifier la formation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFormation} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-title" className="text-sm font-medium">Titre de la formation</Label>
                <Input
                  id="edit-title"
                  value={formationForm.title}
                  onChange={(e) => setFormationForm({ ...formationForm, title: e.target.value })}
                  className="mt-1 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category" className="text-sm font-medium">Catégorie</Label>
                <Select value={formationForm.category} onValueChange={(value) => setFormationForm({ ...formationForm, category: value })}>
                  <SelectTrigger className="mt-1 h-12">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <Badge className={`${category.color} text-white text-xs`}>
                            {category.prefix}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="edit-description"
                value={formationForm.description}
                onChange={(e) => setFormationForm({ ...formationForm, description: e.target.value })}
                rows={4}
                className="mt-1"
                required
              />
            </div>
            
            {/* Image Upload Component for Edit */}
            <ImageUploadComponent isEdit={true} />
            
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="edit-price" className="text-sm font-medium">Prix (DT)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formationForm.price}
                  onChange={(e) => setFormationForm({ ...formationForm, price: e.target.value })}
                  className="mt-1 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-durationWeeks" className="text-sm font-medium">Durée (semaines)</Label>
                <Input
                  id="edit-durationWeeks"
                  type="number"
                  value={formationForm.durationWeeks}
                  onChange={(e) => setFormationForm({ ...formationForm, durationWeeks: e.target.value })}
                  className="mt-1 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-estimatedHours" className="text-sm font-medium">Heures estimées</Label>
                <Input
                  id="edit-estimatedHours"
                  value={formationForm.estimatedHours}
                  onChange={(e) => setFormationForm({ ...formationForm, estimatedHours: e.target.value })}
                  className="mt-1 h-12"
                />
              </div>
              <div>
                <Label htmlFor="edit-maxStudents" className="text-sm font-medium">Max étudiants</Label>
                <Input
                  id="edit-maxStudents"
                  type="number"
                  value={formationForm.maxStudents}
                  onChange={(e) => setFormationForm({ ...formationForm, maxStudents: e.target.value })}
                  className="mt-1 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label htmlFor="edit-type" className="text-sm font-medium">Type de formation</Label>
                <Select value={formationForm.type} onValueChange={(value) => setFormationForm({ ...formationForm, type: value })}>
                  <SelectTrigger className="mt-1 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sociétés">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Sociétés
                      </div>
                    </SelectItem>
                    <SelectItem value="passagers">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Passagers
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-level" className="text-sm font-medium">Niveau</Label>
                <Select value={formationForm.level} onValueChange={(value) => setFormationForm({ ...formationForm, level: value })}>
                  <SelectTrigger className="mt-1 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-difficulty" className="text-sm font-medium">Difficulté (1-5)</Label>
                <Select value={formationForm.difficulty.toString()} onValueChange={(value) => setFormationForm({ ...formationForm, difficulty: parseInt(value) })}>
                  <SelectTrigger className="mt-1 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Très facile</SelectItem>
                    <SelectItem value="2">2 - Facile</SelectItem>
                    <SelectItem value="3">3 - Moyen</SelectItem>
                    <SelectItem value="4">4 - Difficile</SelectItem>
                    <SelectItem value="5">5 - Très difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-prerequisites" className="text-sm font-medium">Prérequis</Label>
                <Textarea
                  id="edit-prerequisites"
                  value={formationForm.prerequisites}
                  onChange={(e) => setFormationForm({ ...formationForm, prerequisites: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-objectives" className="text-sm font-medium">Objectifs</Label>
                <Textarea
                  id="edit-objectives"
                  value={formationForm.objectives}
                  onChange={(e) => setFormationForm({ ...formationForm, objectives: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={uploading} className="bg-gradient-to-r from-green-600 to-blue-600">
                {uploading ? 'Téléchargement...' : 'Modifier la Formation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Content Management Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Gestion du contenu - {selectedFormation?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateContent} className="space-y-6">
            <div className="space-y-4">
              {contentForm.content.map((module, moduleIndex) => (
                <Card key={module.id} className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleExpansion(moduleIndex)}
                        >
                          {expandedModules[moduleIndex] ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                        <div className="flex-1">
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                            placeholder="Titre du module"
                            className="font-semibold"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateModule(moduleIndex)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeModule(moduleIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={module.description}
                      onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                      placeholder="Description du module"
                      rows={2}
                    />
                  </CardHeader>
                  
                  {expandedModules[moduleIndex] && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-700">Leçons</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(moduleIndex)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter une leçon
                          </Button>
                        </div>
                        
                        {module.lessons.map((lesson, lessonIndex) => (
                          <Card key={lesson.id} className="border border-gray-100">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-12 gap-3 items-start">
                                <div className="col-span-4">
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                    placeholder="Titre de la leçon"
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Select 
                                    value={lesson.type} 
                                    onValueChange={(value) => updateLesson(moduleIndex, lessonIndex, 'type', value)}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Texte</SelectItem>
                                      <SelectItem value="video">Vidéo</SelectItem>
                                      <SelectItem value="document">Document</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="link">Lien</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="col-span-5">
                                  <Textarea
                                    value={lesson.content}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                                    placeholder="Contenu de la leçon"
                                    rows={2}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={addModule}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un module
              </Button>
              
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setShowContentModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder le contenu
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedFormations.length)} sur {filteredAndSortedFormations.length} formations
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormationManagement;

