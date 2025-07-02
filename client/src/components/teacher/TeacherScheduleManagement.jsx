import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Plus,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherScheduleManagement = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState({
    weekNumber: 0,
    year: new Date().getFullYear(),
    schedule: []
  });
  const [students, setStudents] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  
  const [scheduleForm, setScheduleForm] = useState({
    formation: '',
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    assignedStudents: [],
    maxStudents: 20
  });

  const daysOfWeek = [
    { value: 1, label: 'Lundi', short: 'Lun', apiValue: 'monday' },
    { value: 2, label: 'Mardi', short: 'Mar', apiValue: 'tuesday' },
    { value: 3, label: 'Mercredi', short: 'Mer', apiValue: 'wednesday' },
    { value: 4, label: 'Jeudi', short: 'Jeu', apiValue: 'thursday' },
    { value: 5, label: 'Vendredi', short: 'Ven', apiValue: 'friday' },
    { value: 6, label: 'Samedi', short: 'Sam', apiValue: 'saturday' },
    { value: 7, label: 'Dimanche', short: 'Dim', apiValue: 'sunday' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    fetchScheduleData();
  }, [currentWeek]);

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
  };

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      const weekStart = getWeekStart(currentWeek);
      const weekNumber = getWeekNumber(weekStart);
      const year = new Date().getFullYear();
      
      const [studentsResponse, formationsResponse, schedulesResponse] = await Promise.all([
        api.get('/users/students/my'),
        api.get('/formations/my/list'),
        api.get(`/schedules/week/${weekNumber}/${year}`)
      ]);

      setStudents(studentsResponse.data || []);
      setFormations(formationsResponse.data || []);

      // Process schedules data for the current week
      const weeklySchedules = schedulesResponse.data || [];
      const processedSchedules = [];

      weeklySchedules.forEach(weekSchedule => {
        if (weekSchedule.schedule && Array.isArray(weekSchedule.schedule)) {
          weekSchedule.schedule.forEach(scheduleItem => {
            processedSchedules.push({
              ...scheduleItem,
              _id: scheduleItem._id,
              mainScheduleId: weekSchedule._id,
              dayOfWeek: daysOfWeek.find(d => d.apiValue === scheduleItem.day)?.value || 1,
              formation: formationsResponse.data.find(f => f._id === weekSchedule.formationId),
              assignedStudents: scheduleItem.students || [],
              title: formationsResponse.data.find(f => f._id === weekSchedule.formationId)?.title || 'Cours',
              location: scheduleItem.room || '',
              description: scheduleItem.notes || '',
              startTime: scheduleItem.startTime,
              endTime: scheduleItem.endTime
            });
          });
        }
      });

      setSchedules({
        weekNumber: weekNumber,
        year: year,
        schedule: processedSchedules
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setSchedules({
        weekNumber: getWeekNumber(getWeekStart(currentWeek)),
        year: new Date().getFullYear(),
        schedule: []
      });
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      const weekNumber = getWeekNumber(getWeekStart(currentWeek));
      const year = new Date().getFullYear();
      
      const newScheduleEntry = {
        day: daysOfWeek.find(d => d.value === scheduleForm.dayOfWeek)?.apiValue || 'monday',
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        students: scheduleForm.assignedStudents,
        room: scheduleForm.location,
        notes: scheduleForm.description
      };

      const response = await api.post('/schedules/save', {
        teacherId: user._id,
        formationId: scheduleForm.formation,
        weekNumber: weekNumber,
        year: year,
        scheduleEntry: newScheduleEntry
      });

      // Update local state with the new schedule entry
      setSchedules(prev => ({
        ...prev,
        schedule: [...prev.schedule, {
          ...newScheduleEntry,
          _id: response.data._id || Date.now().toString(),
          dayOfWeek: scheduleForm.dayOfWeek,
          formation: formations.find(f => f._id === scheduleForm.formation),
          assignedStudents: scheduleForm.assignedStudents,
          title: formations.find(f => f._id === scheduleForm.formation)?.title || 'Cours',
          location: scheduleForm.location,
          description: scheduleForm.description
        }]
      }));

      setShowCreateModal(false);
      resetScheduleForm();
      alert('Créneau créé avec succès');
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Erreur lors de la création du créneau');
    }
  };

  const handleEditSchedule = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/schedules/${selectedSchedule.mainScheduleId}/${selectedSchedule._id}`, {
        formationId: scheduleForm.formation,
        scheduleEntry: {
          day: daysOfWeek.find(d => d.value === scheduleForm.dayOfWeek)?.apiValue || 'monday',
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
          students: scheduleForm.assignedStudents,
          room: scheduleForm.location,
          notes: scheduleForm.description
        }
      });

      setSchedules(prev => ({
        ...prev,
        schedule: prev.schedule.map(item => 
          item._id === selectedSchedule._id ? {
            ...item,
            dayOfWeek: scheduleForm.dayOfWeek,
            formation: formations.find(f => f._id === scheduleForm.formation),
            assignedStudents: scheduleForm.assignedStudents,
            startTime: scheduleForm.startTime,
            endTime: scheduleForm.endTime,
            location: scheduleForm.location,
            description: scheduleForm.description,
            title: formations.find(f => f._id === scheduleForm.formation)?.title || 'Cours'
          } : item
        )
      }));

      setShowEditModal(false);
      resetScheduleForm();
      alert('Créneau modifié avec succès');
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Erreur lors de la modification du créneau');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
      try {
        await api.delete(`/schedules/${scheduleId}`);
        setSchedules(prev => ({
          ...prev,
          schedule: prev.schedule.filter(item => item._id !== scheduleId)
        }));
        alert('Créneau supprimé avec succès');
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Erreur lors de la suppression du créneau');
      }
    }
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule({ ...schedule, mainScheduleId: schedule._id });
    setScheduleForm({
      formation: schedule.formation?._id || '',
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      location: schedule.location,
      description: schedule.description,
      assignedStudents: schedule.assignedStudents || [],
      maxStudents: schedule.maxStudents || 20
    });
    setShowEditModal(true);
  };

  const openCreateModalWithTimeSlot = (dayOfWeek, timeSlot) => {
    setSelectedTimeSlot({ dayOfWeek, timeSlot });
    setScheduleForm({
      ...scheduleForm,
      dayOfWeek,
      startTime: timeSlot,
      endTime: getNextTimeSlot(timeSlot)
    });
    setShowCreateModal(true);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      formation: '',
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
      location: '',
      description: '',
      assignedStudents: [],
      maxStudents: 20
    });
    setSelectedSchedule(null);
    setSelectedTimeSlot(null);
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const getNextTimeSlot = (currentTime) => {
    const currentIndex = timeSlots.indexOf(currentTime);
    return currentIndex < timeSlots.length - 1 ? timeSlots[currentIndex + 1] : currentTime;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const getSchedulesForDay = (dayOfWeek) => {
    return schedules.schedule.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const getScheduleAtTime = (dayOfWeek, timeSlot) => {
    return schedules.schedule.find(schedule => 
      schedule.dayOfWeek === dayOfWeek && 
      schedule.startTime <= timeSlot && 
      schedule.endTime > timeSlot
    );
  };

  const formatWeekRange = () => {
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    return `Semaine ${schedules.weekNumber} (${weekStart.toLocaleDateString('fr-FR')} - ${weekEnd.toLocaleDateString('fr-FR')})`;
  };

  const getScheduleColor = (schedule) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-orange-100 border-orange-300 text-orange-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800'
    ];
    
    const index = schedule.formation ? 
      schedule.formation.title.charCodeAt(0) % colors.length : 
      schedule.title.charCodeAt(0) % colors.length;
    
    return colors[index];
  };

  const calculateScheduleHeight = (schedule) => {
    const startIndex = timeSlots.indexOf(schedule.startTime);
    const endIndex = timeSlots.indexOf(schedule.endTime);
    const duration = endIndex - startIndex;
    return Math.max(duration * 40, 40);
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mon emploi du temps</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-4">{formatWeekRange()}</span>
          <Button variant="outline" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 bg-gray-50 border-r">
                  <span className="text-sm font-medium">Heure</span>
                </div>
                {daysOfWeek.map(day => (
                  <div key={day.value} className="p-4 bg-gray-50 border-r text-center">
                    <div className="text-sm font-medium">{day.label}</div>
                    <div className="text-xs text-gray-500">
                      {(() => {
                        const weekStart = getWeekStart(currentWeek);
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(weekStart.getDate() + day.value - 1);
                        return dayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                      })()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                {timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeSlot} className="grid grid-cols-8 border-b min-h-[40px]">
                    <div className="p-2 bg-gray-50 border-r text-xs text-gray-600 flex items-center">
                      {timeSlot}
                    </div>
                    {daysOfWeek.map(day => {
                      const schedule = getScheduleAtTime(day.value, timeSlot);
                      const isFirstSlotOfSchedule = schedule && schedule.startTime === timeSlot;
                      
                      return (
                        <div 
                          key={`${day.value}-${timeSlot}`} 
                          className="border-r relative cursor-pointer hover:bg-gray-50"
                          onClick={() => !schedule && openCreateModalWithTimeSlot(day.value, timeSlot)}
                        >
                          {isFirstSlotOfSchedule && (
                            <div 
                              className={`absolute inset-x-1 border-2 rounded p-2 ${getScheduleColor(schedule)}`}
                              style={{ 
                                height: `${calculateScheduleHeight(schedule)}px`,
                                zIndex: 10
                              }}
                            >
                              <div className="text-xs font-medium truncate">
                                {schedule.formation?.title || 'Cours'}
                              </div>
                              <div className="text-xs truncate">
                                {schedule.location}
                              </div>
                              <div className="text-xs">
                                {schedule.assignedStudents?.length || 0} étudiants
                              </div>
                              <div className="absolute top-1 right-1 flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-4 w-4 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(schedule);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-4 w-4 p-0 text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSchedule(schedule._id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau créneau</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Formation</Label>
                <Select value={scheduleForm.formation} onValueChange={(value) => setScheduleForm({ ...scheduleForm, formation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une formation" />
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
              <div>
                <Label>Nombre max d'étudiants</Label>
                <Input
                  type="number"
                  value={scheduleForm.maxStudents}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, maxStudents: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Jour de la semaine</Label>
                <Select 
                  value={scheduleForm.dayOfWeek.toString()} 
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heure de début</Label>
                <Select value={scheduleForm.startTime} onValueChange={(value) => setScheduleForm({ ...scheduleForm, startTime: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Début" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heure de fin</Label>
                <Select value={scheduleForm.endTime} onValueChange={(value) => setScheduleForm({ ...scheduleForm, endTime: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lieu</Label>
                <Input
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  placeholder="Salle de classe, en ligne, etc."
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                placeholder="Description du cours"
              />
            </div>

            <div>
              <Label>Étudiants assignés</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {students.map(student => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`student-${student._id}`}
                      checked={scheduleForm.assignedStudents.includes(student._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setScheduleForm({
                            ...scheduleForm,
                            assignedStudents: [...scheduleForm.assignedStudents, student._id]
                          });
                        } else {
                          setScheduleForm({
                            ...scheduleForm,
                            assignedStudents: scheduleForm.assignedStudents.filter(id => id !== student._id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`student-${student._id}`} className="text-sm">
                      {student.name} {student.lastname}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le créneau</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Formation</Label>
                <Select value={scheduleForm.formation} onValueChange={(value) => setScheduleForm({ ...scheduleForm, formation: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une formation" />
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
              <div>
                <Label>Nombre max d'étudiants</Label>
                <Input
                  type="number"
                  value={scheduleForm.maxStudents}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, maxStudents: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Jour de la semaine</Label>
                <Select 
                  value={scheduleForm.dayOfWeek.toString()} 
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Jour" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heure de début</Label>
                <Select value={scheduleForm.startTime} onValueChange={(value) => setScheduleForm({ ...scheduleForm, startTime: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Début" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Heure de fin</Label>
                <Select value={scheduleForm.endTime} onValueChange={(value) => setScheduleForm({ ...scheduleForm, endTime: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(time => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lieu</Label>
                <Input
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  placeholder="Salle de classe, en ligne, etc."
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                placeholder="Description du cours"
              />
            </div>

            <div>
              <Label>Étudiants assignés</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {students.map(student => (
                  <div key={student._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-student-${student._id}`}
                      checked={scheduleForm.assignedStudents.includes(student._id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setScheduleForm({
                            ...scheduleForm,
                            assignedStudents: [...scheduleForm.assignedStudents, student._id]
                          });
                        } else {
                          setScheduleForm({
                            ...scheduleForm,
                            assignedStudents: scheduleForm.assignedStudents.filter(id => id !== student._id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`edit-student-${student._id}`} className="text-sm">
                      {student.name} {student.lastname}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button type="submit">Modifier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherScheduleManagement;