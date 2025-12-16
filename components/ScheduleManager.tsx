import React, { useState } from 'react';
import { Course, DayOfWeek } from '../types';
import { Trash2, Plus, Clock, User } from './Icons';

interface ScheduleManagerProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const COLORS = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-orange-100 text-orange-700 border-orange-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-teal-100 text-teal-700 border-teal-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-sky-100 text-sky-700 border-sky-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-violet-100 text-violet-700 border-violet-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-rose-100 text-rose-700 border-rose-200',
];

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ courses, setCourses }) => {
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    day: DayOfWeek.Sunday,
    color: COLORS[0],
  });

  const addCourse = () => {
    if (!newCourse.name || !newCourse.startTime || !newCourse.endTime) return;

    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      day: newCourse.day as DayOfWeek,
      startTime: newCourse.startTime,
      endTime: newCourse.endTime,
      instructor: newCourse.instructor || '',
      location: newCourse.location || '',
      color: newCourse.color || COLORS[0],
    };

    setCourses([...courses, course]);
    setNewCourse({ ...newCourse, name: '', instructor: '', location: '', startTime: '', endTime: '' });
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // Group courses by day for display
  const coursesByDay = Object.values(DayOfWeek).map(day => ({
    day,
    courses: courses.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-600" />
          إضافة مادة دراسية
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="اسم المادة"
            value={newCourse.name || ''}
            onChange={e => setNewCourse({ ...newCourse, name: e.target.value })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <select
            value={newCourse.day}
            onChange={e => setNewCourse({ ...newCourse, day: e.target.value as DayOfWeek })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {Object.values(DayOfWeek).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="flex gap-2">
             <input
              type="time"
              value={newCourse.startTime || ''}
              onChange={e => setNewCourse({ ...newCourse, startTime: e.target.value })}
              className="w-1/2 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="self-center text-slate-400">إلى</span>
             <input
              type="time"
              value={newCourse.endTime || ''}
              onChange={e => setNewCourse({ ...newCourse, endTime: e.target.value })}
              className="w-1/2 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
           <input
            type="text"
            placeholder="اسم المحاضر / القاعة (اختياري)"
            value={newCourse.instructor || ''}
            onChange={e => setNewCourse({ ...newCourse, instructor: e.target.value })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        {/* Color Picker */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {COLORS.map((color, idx) => (
             <button
              key={idx}
              onClick={() => setNewCourse({...newCourse, color})}
              className={`w-8 h-8 rounded-full flex-shrink-0 transition-transform hover:scale-110 ${color.split(' ')[0]} ${newCourse.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : ''}`}
             />
          ))}
        </div>

        <button
          onClick={addCourse}
          className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-primary-500/30 flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إضافة للجدول
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coursesByDay.map(({ day, courses }) => (
          <div key={day} className={`rounded-2xl border ${courses.length > 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'} p-4 shadow-sm transition-all hover:shadow-md`}>
            <h3 className="font-bold text-lg mb-3 text-slate-700 border-b border-slate-100 pb-2">{day}</h3>
            {courses.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد محاضرات</p>
            ) : (
              <div className="space-y-3">
                {courses.map(course => (
                  <div key={course.id} className={`p-3 rounded-xl border ${course.color} relative group`}>
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base truncate">{course.name}</h4>
                        <button 
                          onClick={() => deleteCourse(course.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-white/50 p-1 rounded-full transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex items-center gap-1 text-xs mt-2 opacity-80 font-medium">
                        <Clock className="w-3 h-3" />
                        {course.startTime} - {course.endTime}
                     </div>
                     {course.instructor && (
                       <div className="flex items-center gap-1 text-xs mt-1 opacity-80">
                          <User className="w-3 h-3" />
                          {course.instructor}
                       </div>
                     )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleManager;