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
  UserPlus
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
    { id: 'other', name: 'Autre', prefix: 'OTHR', color: 'bg-gray-500', icon: '❓' }
  ];
  
  const [formationForm, setFormationForm] = useState({
    title: '',
    description: '',
    price: '',
    durationWeeks: '',
    type: 'online',
    category: '',
    categoryPrefix: '',
    level: 'beginner',
    maxStudents: '',
    prerequisites: '',
    objectives: '',
    isActive: true,
    tags: [],
    thumbnail: '',
    difficulty: 1,
    estimatedHours: ''
  });

  const [contentForm, setContentForm] = useState({
    chapters: [
      {
        id: Date.now(),
        title: '',
        description: '',
        order: 1,
        isExpanded: true,
        lessons: [
          {
            id: Date.now(),
            title: '',
            content: '',
            type: 'text',
            url: '',
            duration: '',
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
      const formationData = {
        ...formationForm,
        thumbnail: thumbnailPath,
        categoryPrefix: selectedCat?.prefix || '',
        formationCode: `${selectedCat?.prefix || 'GEN'}-${Date.now().toString().slice(-6)}`
      };
      
      const response = await api.post('/formations', formationData);
      setFormations([...formations, response.data.formation]);
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
        thumbnail: thumbnailPath
      };

      const response = await api.put(`/formations/${selectedFormation._id}`, updatedFormationData);
      setFormations(formations.map(formation => 
        formation._id === selectedFormation._id ? response.data.formation : formation
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
      await api.put(`/formations/${selectedFormation._id}/content`, contentForm);
      setShowContentModal(false);
      alert('Contenu mis à jour avec succès');
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
      title: formation.title,
      description: formation.description,
      price: formation.price,
      durationWeeks: formation.durationWeeks,
      type: formation.type,
      category: formation.category,
      categoryPrefix: formation.categoryPrefix,
      level: formation.level,
      maxStudents: formation.maxStudents,
      prerequisites: formation.prerequisites,
      objectives: formation.objectives,
      isActive: formation.isActive,
      tags: formation.tags || [],
      thumbnail: formation.thumbnail || '',
      difficulty: formation.difficulty || 1,
      estimatedHours: ''
    });
    
    // Set image preview if thumbnail exists
    if (formation.thumbnail) {
      setImagePreview(formation.thumbnail);
    }
    
    setShowEditModal(true);
  };

  const openContentModal = (formation) => {
    setSelectedFormation(formation);
    // Use the content directly from the formation object if it exists, otherwise initialize with an empty chapters array
    setContentForm({ chapters: formation.content || [] });
    setShowContentModal(true);
  };

  const resetForm = () => {
    setFormationForm({
      title: '',
      description: '',
      price: '',
      durationWeeks: '',
      type: 'online',
      category: '',
      categoryPrefix: '',
      level: 'beginner',
      maxStudents: '',
      prerequisites: '',
      objectives: '',
      isActive: true,
      tags: [],
      thumbnail: '',
      difficulty: 1,
      estimatedHours: ''
    });
    setSelectedFormation(null);
    setSelectedImage(null);
    setImagePreview('');
  };

  // Enhanced content management functions
  const addChapter = () => {
    const newChapter = {
      id: Date.now(),
      title: '',
      description: '',
      order: contentForm.chapters.length + 1,
      isExpanded: true,
      lessons: [{
        id: Date.now() + 1,
        title: '',
        content: '',
        type: 'text',
        url: '',
        duration: '',
        order: 1,
        isCompleted: false,
        resources: []
      }]
    };
    setContentForm({
      ...contentForm,
      chapters: [...contentForm.chapters, newChapter]
    });
  };

  const addLesson = (chapterIndex) => {
    const updatedChapters = [...contentForm.chapters];
    const newLesson = {
      id: Date.now(),
      title: '',
      content: '',
      type: 'text',
      url: '',
      duration: '',
      order: updatedChapters[chapterIndex].lessons.length + 1,
      isCompleted: false,
      resources: []
    };
    updatedChapters[chapterIndex].lessons.push(newLesson);
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const updateChapter = (chapterIndex, field, value) => {
    const updatedChapters = [...contentForm.chapters];
    updatedChapters[chapterIndex][field] = value;
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const updateLesson = (chapterIndex, lessonIndex, field, value) => {
    const updatedChapters = [...contentForm.chapters];
    updatedChapters[chapterIndex].lessons[lessonIndex][field] = value;
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const removeChapter = (chapterIndex) => {
    const updatedChapters = contentForm.chapters.filter((_, index) => index !== chapterIndex);
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const removeLesson = (chapterIndex, lessonIndex) => {
    const updatedChapters = [...contentForm.chapters];
    updatedChapters[chapterIndex].lessons = updatedChapters[chapterIndex].lessons.filter((_, index) => index !== lessonIndex);
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const toggleChapterExpansion = (chapterIndex) => {
    const updatedChapters = [...contentForm.chapters];
    updatedChapters[chapterIndex].isExpanded = !updatedChapters[chapterIndex].isExpanded;
    setContentForm({ ...contentForm, chapters: updatedChapters });
  };

  const duplicateChapter = (chapterIndex) => {
    const chapterToDuplicate = { ...contentForm.chapters[chapterIndex] };
    chapterToDuplicate.id = Date.now();
    chapterToDuplicate.title = `${chapterToDuplicate.title} (Copie)`;
    chapterToDuplicate.order = contentForm.chapters.length + 1;
    chapterToDuplicate.lessons = chapterToDuplicate.lessons.map(lesson => ({
      ...lesson,
      id: Date.now() + Math.random()
    }));
    
    setContentForm({
      ...contentForm,
      chapters: [...contentForm.chapters, chapterToDuplicate]
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
      case 'online': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'presentielle': return 'bg-green-100 text-green-800 border-green-200';
      case 'hybrid': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <p className="text-xs text-gray-400">PNG, JPG, GIF jusqu\'à 10MB</p>
          </label>
        </div>
      )}
      
      {/* Manual URL Input */}
      <div>
        <Label htmlFor="thumbnail-url" className="text-sm font-medium">Ou entrez une URL d\'image</Label>
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
                      placeholder="Ex: Développement Web Avancé"
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
                    placeholder="Décrivez votre formation en détail..."
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
                      placeholder="8"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours" className="text-sm font-medium">Heures estimées</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      value={formationForm.estimatedHours}
                      onChange={(e) => setFormationForm({ ...formationForm, estimatedHours: e.target.value })}
                      className="mt-1 h-12"
                      placeholder="40"
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
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type" className="text-sm font-medium">Type de formation</Label>
                    <Select value={formationForm.type} onValueChange={(value) => setFormationForm({ ...formationForm, type: value })}>
                      <SelectTrigger className="mt-1 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">En ligne</SelectItem>
                        <SelectItem value="presentielle">Présentielle</SelectItem>
                        <SelectItem value="hybrid">Hybride</SelectItem>
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
                      placeholder="Listez les prérequis nécessaires..."
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
                      placeholder="Décrivez les objectifs d\'apprentissage..."
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
              Formations Actives
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formations.filter(f => f.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Catégories
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('durationWeeks')}
                      className="font-semibold text-gray-700 hover:text-blue-600 p-0 h-auto"
                    >
                      Durée
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="flex items-center space-x-3">
                        
                          <div className="text-sm font-medium text-gray-900">
                            {formation.title}
                            <div className="text-xs text-gray-500">
                              {formation.description?.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${categoryInfo.color} text-white`}>
                          {categoryInfo.name}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getTypeColor(formation.type)}`}>
                          {formation.type === 'online' ? 'En ligne' :
                           formation.type === 'presentielle' ? 'Présentielle' : 'Hybride'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getLevelColor(formation.level)}`}>
                          {formation.level === 'beginner' ? 'Débutant' :
                           formation.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formation.price} DT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formation.durationWeeks} sem.
                        {formation.estimatedHours && (
                          <div className="text-xs text-gray-500">({formation.estimatedHours}h)</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formation.isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Actif</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-100 text-red-800">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-center">
                          <Button variant="ghost" size="sm" title="Voir le contenu" onClick={() => openContentModal(formation)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Modifier" onClick={() => openEditModal(formation)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Supprimer" onClick={() => handleDeleteFormation(formation._id)} className="text-red-600 hover:text-red-900">
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredAndSortedFormations.length)} sur {filteredAndSortedFormations.length} formations
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="h-8 w-8 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {paginatedFormations.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune formation trouvée</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Commencez par créer votre première formation.'}
              </p>
              {(!searchTerm && selectedCategory === 'all') && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une formation
                </Button>
              )}
            </div>
          )}
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
                  placeholder="Ex: Développement Web Avancé"
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
                placeholder="Décrivez votre formation en détail..."
                required
              />
            </div>
            
            {/* Image Upload Component */}
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
                  placeholder="0"
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
                  placeholder="8"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-estimatedHours" className="text-sm font-medium">Heures estimées</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  value={formationForm.estimatedHours}
                  onChange={(e) => setFormationForm({ ...formationForm, estimatedHours: e.target.value })}
                  className="mt-1 h-12"
                  placeholder="40"
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
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-type" className="text-sm font-medium">Type de formation</Label>
                <Select value={formationForm.type} onValueChange={(value) => setFormationForm({ ...formationForm, type: value })}>
                  <SelectTrigger className="mt-1 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">En ligne</SelectItem>
                    <SelectItem value="presentielle">Présentielle</SelectItem>
                    <SelectItem value="hybrid">Hybride</SelectItem>
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
                  placeholder="Listez les prérequis nécessaires..."
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
                  placeholder="Décrivez les objectifs d\'apprentissage..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formationForm.isActive}
                onChange={(e) => setFormationForm({ ...formationForm, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="edit-isActive" className="text-sm font-medium">Formation active</Label>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {uploading ? 'Téléchargement...' : 'Sauvegarder les modifications'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Contenu de la formation: {selectedFormation?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateContent} className="space-y-6">
            {contentForm.chapters.map((chapter, chapterIndex) => (
              <Card key={chapter.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleChapterExpansion(chapterIndex)}
                      className="p-0 h-auto"
                    >
                      {chapter.isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>
                    Chapitre {chapterIndex + 1}: 
                    <Input
                      value={chapter.title}
                      onChange={(e) => updateChapter(chapterIndex, 'title', e.target.value)}
                      placeholder="Titre du chapitre"
                      className="ml-2 text-lg font-semibold border-none focus-visible:ring-0"
                    />
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateChapter(chapterIndex)}
                      title="Dupliquer le chapitre"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeChapter(chapterIndex)}
                      title="Supprimer le chapitre"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {chapter.isExpanded && (
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor={`chapter-description-${chapter.id}`}>Description du chapitre</Label>
                      <Textarea
                        id={`chapter-description-${chapter.id}`}
                        value={chapter.description}
                        onChange={(e) => updateChapter(chapterIndex, 'description', e.target.value)}
                        placeholder="Description du chapitre"
                        rows={2}
                      />
                    </div>
                    <h4 className="text-md font-semibold mt-4">Leçons:</h4>
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="border p-3 rounded-md bg-white shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Leçon {lessonIndex + 1}:</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeLesson(chapterIndex, lessonIndex)}
                              title="Supprimer la leçon"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`lesson-title-${lesson.id}`}>Titre de la leçon</Label>
                          <Input
                            id={`lesson-title-${lesson.id}`}
                            value={lesson.title}
                            onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'title', e.target.value)}
                            placeholder="Titre de la leçon"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lesson-type-${lesson.id}`}>Type de contenu</Label>
                          <Select
                            value={lesson.type}
                            onValueChange={(value) => updateLesson(chapterIndex, lessonIndex, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez le type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texte</SelectItem>
                              <SelectItem value="video">Vidéo</SelectItem>
                              <SelectItem value="document">Document</SelectItem>
                              <SelectItem value="link">Lien</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {lesson.type === 'text' && (
                          <div>
                            <Label htmlFor={`lesson-content-${lesson.id}`}>Contenu</Label>
                            <Textarea
                              id={`lesson-content-${lesson.id}`}
                              value={lesson.content}
                              onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'content', e.target.value)}
                              placeholder="Contenu de la leçon"
                              rows={4}
                            />
                          </div>
                        )}
                        {(lesson.type === 'video' || lesson.type === 'document' || lesson.type === 'link' || lesson.type === 'image') && (
                          <div>
                            <Label htmlFor={`lesson-url-${lesson.id}`}>URL du contenu</Label>
                            <Input
                              id={`lesson-url-${lesson.id}`}
                              value={lesson.url}
                              onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'url', e.target.value)}
                              placeholder="URL du contenu (ex: YouTube, Drive, image URL)"
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor={`lesson-duration-${lesson.id}`}>Durée (minutes)</Label>
                          <Input
                            id={`lesson-duration-${lesson.id}`}
                            type="number"
                            value={lesson.duration}
                            onChange={(e) => updateLesson(chapterIndex, lessonIndex, 'duration', e.target.value)}
                            placeholder="Durée estimée en minutes"
                          />
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => addLesson(chapterIndex)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Ajouter une leçon
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
            <Button type="button" onClick={addChapter} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-5 w-5 mr-2" /> Ajouter un chapitre
            </Button>
            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowContentModal(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Sauvegarder le contenu
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFormationManagement;

