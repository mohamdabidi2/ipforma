import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { 
  Search,
  Lock,
  Unlock,
  Eye,
  Download,
  FileText,
  Image,
  Video,
  File,
  Link,
  Calendar,
  User,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentSpaceAccess = () => {
  const { user } = useAuth();
  const [allSpaces, setAllSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [spaceContent, setSpaceContent] = useState({ files: [], links: [], categorized: {} });
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [accessedSpaces, setAccessedSpaces] = useState({});

  // Load accessed spaces from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('accessedSpaces');
    if (stored) {
      try {
        setAccessedSpaces(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored accessed spaces:', error);
        localStorage.removeItem('accessedSpaces');
      }
    }
  }, []);

  useEffect(() => {
    fetchAllSpaces();
  }, []);

  const fetchAllSpaces = async () => {
    try {
      setLoading(true);
      
      // Fetch all available spaces in table format
      const response = await api.get('/teacher-spaces/all-spaces-table');
      if (response.data.success) {
        setAllSpaces(response.data.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching spaces:', error);
      setLoading(false);
    }
  };

  const saveAccessedSpace = (spaceId, spaceData) => {
    const newAccessedSpaces = {
      ...accessedSpaces,
      [spaceId]: {
        accessedAt: new Date().toISOString(),
        title: spaceData.title,
        expiresAt: null // Could add expiration logic later
      }
    };
    setAccessedSpaces(newAccessedSpaces);
    localStorage.setItem('accessedSpaces', JSON.stringify(newAccessedSpaces));
  };

  const hasAccess = (spaceId) => {
    return accessedSpaces.hasOwnProperty(spaceId);
  };

  const handleSpaceClick = async (space) => {
    if (hasAccess(space._id)) {
      // Direct access - show content
      await handleViewContent(space);
    } else {
      // Need password - show password modal
      handleAccessSpace(space);
    }
  };

  const handleAccessSpace = (space) => {
    setSelectedSpace(space);
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/teacher-spaces/${selectedSpace._id}/verify-password`, {
        password: passwordInput
      });
      
      if (response.data.success) {
        // Save access to localStorage
        saveAccessedSpace(selectedSpace._id, selectedSpace);
        
        setShowPasswordModal(false);
        
        // Show success message
        alert('Accès accordé à l\'espace de cours !');
        
        // Automatically open content
        await handleViewContent(selectedSpace);
      } else {
        alert('Mot de passe incorrect');
      }
    } catch (error) {
      console.error('Error accessing space:', error);
      if (error.response?.status === 401) {
        alert('Mot de passe incorrect');
      } else {
        alert('Erreur lors de l\'accès à l\'espace');
      }
    }
  };

  const handleViewContent = async (space) => {
    setSelectedSpace(space);
    try {
      const response = await api.get(`/teacher-spaces/${space._id}/content`);
      if (response.data.success) {
        setSpaceContent(response.data.data || { files: [], links: [], categorized: {} });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setSpaceContent({ files: [], links: [], categorized: {} });
    }
    setShowContentModal(true);
  };

  const handleDownloadFile = async (spaceId, fileId, fileName) => {
    try {
      const response = await api.get(`/teacher-spaces/${spaceId}/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const handleLinkClick = async (spaceId, linkId, url) => {
    try {
      // Track the click
      await api.post(`/teacher-spaces/${spaceId}/links/${linkId}/click`);
      
      // Open the link
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Still open the link even if tracking fails
      window.open(url, '_blank');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSpaces = React.useMemo(() => {
    let sortableSpaces = [...allSpaces];
    if (sortConfig.key) {
      sortableSpaces.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'teacher') {
          aValue = a.teacher?.name || '';
          bValue = b.teacher?.name || '';
        }

        // Handle dates
        if (sortConfig.key === 'lastUpdated' || sortConfig.key === 'expiryDate') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSpaces;
  }, [allSpaces, sortConfig]);

  const filteredSpaces = sortedSpaces.filter(space =>
    space.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.formation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <Image className="h-4 w-4 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov': return <Video className="h-4 w-4 text-blue-600" />;
      default: return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (space) => {
    if (space.isExpired) {
      return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
    }
    if (hasAccess(space._id)) {
      return <Badge className="bg-green-100 text-green-800">Accessible</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800">Protégé</Badge>;
  };

  const getStatusIcon = (space) => {
    if (space.isExpired) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    if (hasAccess(space._id)) {
      return <Unlock className="h-4 w-4 text-green-600" />;
    }
    return <Lock className="h-4 w-4 text-orange-600" />;
  };

  const SortableHeader = ({ children, sortKey }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </th>
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
        <h2 className="text-2xl font-bold">Espaces de cours</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des espaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="text-sm text-gray-500">
            {filteredSpaces.length} espace{filteredSpaces.length !== 1 ? 's' : ''} trouvé{filteredSpaces.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Table Layout */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader sortKey="title">Titre</SortableHeader>
                  <SortableHeader sortKey="description">Description</SortableHeader>
                  <SortableHeader sortKey="teacher">Enseignant</SortableHeader>
              
                  <SortableHeader sortKey="filesCount">Fichiers</SortableHeader>
                  <SortableHeader sortKey="status">Statut</SortableHeader>
                  <SortableHeader sortKey="lastUpdated">Dernière MAJ</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSpaces.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun espace de cours trouvé.</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-2">
                          Essayez de modifier votre recherche.
                        </p>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSpaces.map((space, index) => (
                    <tr 
                      key={space._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                      onClick={() => !space.isExpired && handleSpaceClick(space)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(space)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {space.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {space.description || 'Aucune description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{space.teacher.name}</div>
                        <div className="text-sm text-gray-500">{space.teacher.email}</div>
                      </td>
                     
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-sm font-medium text-gray-900">{space.filesCount}</span>
                          <FileText className="h-3 w-3 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(space)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(space.lastUpdated).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          size="sm"
                          variant={space.isExpired ? "secondary" : hasAccess(space._id) ? "default" : "outline"}
                          disabled={space.isExpired}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!space.isExpired) {
                              handleSpaceClick(space);
                            }
                          }}
                        >
                          {space.isExpired ? (
                            <>
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Expiré
                            </>
                          ) : hasAccess(space._id) ? (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Accéder
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Accéder à l'espace de cours</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Entrez le mot de passe fourni par votre enseignant pour accéder à l'espace "{selectedSpace?.title}".
              </p>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Entrez le mot de passe"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Unlock className="h-4 w-4 mr-2" />
                    Accéder
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Content Modal */}
      <Dialog open={showContentModal} onOpenChange={setShowContentModal}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>{selectedSpace?.title}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedSpace?.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedSpace.description}</p>
              </div>
            )}

            {/* Files Section */}
            {spaceContent.files && spaceContent.files.length > 0 && (
              <div>
                <h4 className="font-medium mb-4 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Fichiers ({spaceContent.files.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {spaceContent.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.originalName)}
                        <div>
                          <p className="text-sm font-medium truncate max-w-xs">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {spaceContent.space?.allowDownload && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadFile(selectedSpace._id, file._id, file.originalName)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Télécharger
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Links Section */}
            {spaceContent.links && spaceContent.links.length > 0 && (
              <div>
                <h4 className="font-medium mb-4 flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  Liens ({spaceContent.links.length})
                </h4>
                <div className="space-y-3">
                  {spaceContent.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{link.title}</p>
                          {link.description && (
                            <p className="text-xs text-gray-500">{link.description}</p>
                          )}
                          <p className="text-xs text-blue-600 truncate max-w-xs">{link.url}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLinkClick(selectedSpace._id, link._id, link.url)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ouvrir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!spaceContent.files || spaceContent.files.length === 0) && 
             (!spaceContent.links || spaceContent.links.length === 0) && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun contenu disponible dans cet espace.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSpaceAccess;

