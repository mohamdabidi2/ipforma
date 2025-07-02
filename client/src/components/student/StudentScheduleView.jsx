import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentScheduleView = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const daysOfWeek = [
    { value: 1, label: 'Lundi', short: 'Lun' },
    { value: 2, label: 'Mardi', short: 'Mar' },
    { value: 3, label: 'Mercredi', short: 'Mer' },
    { value: 4, label: 'Jeudi', short: 'Jeu' },
    { value: 5, label: 'Vendredi', short: 'Ven' },
    { value: 6, label: 'Samedi', short: 'Sam' },
    { value: 7, label: 'Dimanche', short: 'Dim' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    fetchScheduleData();
  }, [currentWeek]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      
      // Get week start and end dates
      const weekStart = getWeekStart(currentWeek);
      const weekEnd = getWeekEnd(currentWeek);
      
      // Fetch student schedules for the current week
      const response = await api.get(`/student-schedules/my-schedule?start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`);
      setSchedules(Array.isArray(response.data) ? response.data : []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  const getSchedulesForDay = (dayOfWeek) => {
    return schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek);
  };

  const getScheduleAtTime = (dayOfWeek, timeSlot) => {
    return schedules.find(schedule => 
      schedule.dayOfWeek === dayOfWeek && 
      schedule.startTime <= timeSlot && 
      schedule.endTime > timeSlot
    );
  };

  const formatWeekRange = () => {
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    return `${weekStart.toLocaleDateString('fr-FR')} - ${weekEnd.toLocaleDateString('fr-FR')}`;
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
    
    const index = schedule.teacher ? 
      schedule.teacher.name.charCodeAt(0) % colors.length : 
      schedule.title.charCodeAt(0) % colors.length;
    
    return colors[index];
  };

  const calculateScheduleHeight = (schedule) => {
    const startIndex = timeSlots.indexOf(schedule.startTime);
    const endIndex = timeSlots.indexOf(schedule.endTime);
    const duration = endIndex - startIndex;
    return Math.max(duration * 40, 40); // Minimum 40px height
  };

  const isCurrentTime = (timeSlot) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30}`;
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    
    return now >= weekStart && now <= weekEnd && timeSlot === currentTime;
  };

  const isToday = (dayOfWeek) => {
    const today = new Date();
    const todayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    
    return today >= weekStart && today <= weekEnd && dayOfWeek === todayOfWeek;
  };

  const getUpcomingClasses = () => {
    const now = new Date();
    const upcoming = schedules.filter(schedule => {
      const scheduleDate = new Date();
      const weekStart = getWeekStart(currentWeek);
      scheduleDate.setDate(weekStart.getDate() + schedule.dayOfWeek - 1);
      
      const [hours, minutes] = schedule.startTime.split(':');
      scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return scheduleDate > now;
    }).sort((a, b) => {
      const dateA = new Date();
      const weekStartA = getWeekStart(currentWeek);
      dateA.setDate(weekStartA.getDate() + a.dayOfWeek - 1);
      const [hoursA, minutesA] = a.startTime.split(':');
      dateA.setHours(parseInt(hoursA), parseInt(minutesA), 0, 0);
      
      const dateB = new Date();
      const weekStartB = getWeekStart(currentWeek);
      dateB.setDate(weekStartB.getDate() + b.dayOfWeek - 1);
      const [hoursB, minutesB] = b.startTime.split(':');
      dateB.setHours(parseInt(hoursB), parseInt(minutesB), 0, 0);
      
      return dateA - dateB;
    });
    
    return upcoming.slice(0, 3);
  };

  const getTodayClasses = () => {
    const today = new Date();
    const todayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const weekStart = getWeekStart(currentWeek);
    const weekEnd = getWeekEnd(currentWeek);
    
    if (today < weekStart || today > weekEnd) return [];
    
    return schedules.filter(schedule => schedule.dayOfWeek === todayOfWeek);
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
          <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
            Aujourd'hui
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cours cette semaine</p>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Heures de cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules.reduce((total, schedule) => {
                    const startIndex = timeSlots.indexOf(schedule.startTime);
                    const endIndex = timeSlots.indexOf(schedule.endTime);
                    return total + (endIndex - startIndex) * 0.5; // Each slot is 30 minutes
                  }, 0)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enseignants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(schedules.map(s => s.teacher?._id).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      {getTodayClasses().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Cours d'aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTodayClasses().map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm font-medium">{schedule.startTime}</p>
                      <p className="text-xs text-gray-500">{schedule.endTime}</p>
                    </div>
                    <div>
                      <p className="font-medium">{schedule.title}</p>
                      <p className="text-sm text-gray-600">{schedule.teacher?.name} {schedule.teacher?.lastname}</p>
                      {schedule.location && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {schedule.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {schedule.formation && (
                      <Badge variant="outline">{schedule.formation.title}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-4 bg-gray-50 border-r">
                  <span className="text-sm font-medium">Heure</span>
                </div>
                {daysOfWeek.map(day => (
                  <div key={day.value} className={`p-4 border-r text-center ${isToday(day.value) ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <div className={`text-sm font-medium ${isToday(day.value) ? 'text-blue-800' : ''}`}>
                      {day.label}
                    </div>
                    <div className={`text-xs ${isToday(day.value) ? 'text-blue-600' : 'text-gray-500'}`}>
                      {(() => {
                        const weekStart = getWeekStart(currentWeek);
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(weekStart.getDate() + day.value - 1);
                        return dayDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
                      })()}
                    </div>
                    {isToday(day.value) && (
                      <div className="text-xs text-blue-600 font-medium mt-1">Aujourd'hui</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Time slots */}
              <div className="relative">
                {timeSlots.map((timeSlot, timeIndex) => (
                  <div key={timeSlot} className={`grid grid-cols-8 border-b min-h-[40px] ${isCurrentTime(timeSlot) ? 'bg-yellow-50' : ''}`}>
                    <div className={`p-2 border-r text-xs flex items-center ${isCurrentTime(timeSlot) ? 'bg-yellow-100 text-yellow-800 font-medium' : 'bg-gray-50 text-gray-600'}`}>
                      {timeSlot}
                      {isCurrentTime(timeSlot) && (
                        <div className="ml-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    {daysOfWeek.map(day => {
                      const schedule = getScheduleAtTime(day.value, timeSlot);
                      const isFirstSlotOfSchedule = schedule && schedule.startTime === timeSlot;
                      
                      return (
                        <div 
                          key={`${day.value}-${timeSlot}`} 
                          className={`border-r relative ${isToday(day.value) ? 'bg-blue-25' : ''}`}
                        >
                          {isFirstSlotOfSchedule && (
                            <div 
                              className={`absolute inset-x-1 border-2 rounded p-2 ${getScheduleColor(schedule)} shadow-sm`}
                              style={{ 
                                height: `${calculateScheduleHeight(schedule)}px`,
                                zIndex: 10
                              }}
                            >
                              <div className="text-xs font-medium truncate">
                                {schedule.title}
                              </div>
                              <div className="text-xs truncate">
                                {schedule.teacher?.name} {schedule.teacher?.lastname}
                              </div>
                              {schedule.formation && (
                                <div className="text-xs truncate">
                                  {schedule.formation.title}
                                </div>
                              )}
                              {schedule.location && (
                                <div className="text-xs truncate flex items-center">
                                  <MapPin className="h-2 w-2 mr-1" />
                                  {schedule.location}
                                </div>
                              )}
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

      {/* Upcoming Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Prochains cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getUpcomingClasses().length > 0 ? (
              <div className="space-y-3">
                {getUpcomingClasses().map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{schedule.title}</p>
                      <p className="text-sm text-gray-600">{schedule.teacher?.name} {schedule.teacher?.lastname}</p>
                      <p className="text-xs text-gray-500">
                        {daysOfWeek.find(d => d.value === schedule.dayOfWeek)?.label} {schedule.startTime}
                      </p>
                    </div>
                    <div className="text-right">
                      {schedule.formation && (
                        <Badge variant="outline" className="text-xs">
                          {schedule.formation.title}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun cours à venir cette semaine</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Mes formations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(schedules.map(s => s.formation?.title).filter(Boolean))).map((formation, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{formation}</span>
                  <Badge variant="outline">
                    {schedules.filter(s => s.formation?.title === formation).length} cours
                  </Badge>
                </div>
              ))}
              {schedules.filter(s => !s.formation).length > 0 && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-500">Cours sans formation</span>
                  <Badge variant="outline">
                    {schedules.filter(s => !s.formation).length} cours
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours cette semaine</h3>
            <p className="text-gray-500">
              Votre emploi du temps est vide pour cette semaine. Vérifiez avec vos enseignants ou consultez une autre semaine.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentScheduleView;

