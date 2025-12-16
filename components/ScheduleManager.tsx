import React, { useState } from 'react';
import { Course, DayOfWeek } from '../types';
import { Trash2, Plus, Clock, User, Pencil, XCircle, CheckCircle } from './Icons';

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
  const [formData, setFormData] = useState<Partial<Course>>({
    day: DayOfWeek.Sunday,
    color: COLORS[0],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!formData.name || !formData.startTime || !formData.endTime) return;

    if (editingId) {
      // Update existing course
      setCourses(courses.map(c => c.id === editingId ? {
        ...c,
        name: formData.name!,
        day: formData.day as DayOfWeek,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        instructor: formData.instructor || '',
        location: formData.location || '',
        color: formData.color || COLORS[0],
      } : c));
      setEditingId(null);
    } else {
      // Add new course
      const course: Course = {
        id: Date.now().toString(),
        name: formData.name!,
        day: formData.day as DayOfWeek,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        instructor: formData.instructor || '',
        location: formData.location || '',
        color: formData.color || COLORS[0],
      };
      setCourses([...courses, course]);
    }
    
    // Reset form
    setFormData({ 
      name: '', 
      instructor: '', 
      location: '', 
      startTime: '', 
      endTime: '',
      day: DayOfWeek.Sunday,
      color: COLORS[0] 
    });
  };

  const handleEdit = (course: Course) => {
    setFormData(course);
    setEditingId(course.id);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      name: '', 
      instructor: '', 
      location: '', 
      startTime: '', 
      endTime: '',
      day: DayOfWeek.Sunday,
      color: COLORS[0] 
    });
  };

  const deleteCourse = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      setCourses(courses.filter(c => c.id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };

  // Group courses by day for display
  const coursesByDay = Object.values(DayOfWeek).map(day => ({
    day,
    courses: courses.filter(c => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className={`p-6 rounded-2xl shadow-sm border transition-colors ${editingId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${editingId ? 'text-indigo-700' : 'text-slate-800'}`}>
          {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5 text-primary-600" />}
          {editingId ? 'تعديل المادة' : 'إضافة مادة دراسية'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="اسم المادة"
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-white/80"
          />
          <select
            value={formData.day}
            onChange={e => setFormData({ ...formData, day: e.target.value as DayOfWeek })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80"
          >
            {Object.values(DayOfWeek).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <div className="flex gap-2">
             <input
              type="time"
              value={formData.startTime || ''}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              className="w-1/2 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80"
            />
            <span className="self-center text-slate-400">إلى</span>
             <input
              type="time"
              value={formData.endTime || ''}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              className="w-1/2 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80"
            />
          </div>
           <input
            type="text"
            placeholder="اسم المحاضر / القاعة (اختياري)"
            value={formData.instructor || ''}
            onChange={e => setFormData({ ...formData, instructor: e.target.value })}
            className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white/80"
          />
        </div>
        
        {/* Color Picker */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {COLORS.map((color, idx) => (
             <button
              key={idx}
              onClick={() => setFormData({...formData, color})}
              type="button"
              className={`w-8 h-8 rounded-full flex-shrink-0 transition-all hover:scale-110 ${color.split(' ')[0]} ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary-500 scale-110 shadow-md' : 'opacity-70 hover:opacity-100'}`}
             />
          ))}
        </div>

        <div className="mt-6 flex gap-3">
            <button
            onClick={handleSubmit}
            disabled={!formData.name || !formData.startTime || !formData.endTime}
            className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2
                ${editingId 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30' 
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
            {editingId ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? 'حفظ التعديلات' : 'إضافة للجدول'}
            </button>
            
            {editingId && (
                <button
                    onClick={handleCancelEdit}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                >
                    <XCircle className="w-5 h-5" />
                    إلغاء
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {coursesByDay.map(({ day, courses }) => (
          <div key={day} className={`rounded-2xl border ${courses.length > 0 ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-70'} p-4 shadow-sm transition-all hover:shadow-md h-full`}>
            <h3 className="font-bold text-lg mb-3 text-slate-700 border-b border-slate-100 pb-2">{day}</h3>
            {courses.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">لا توجد محاضرات</p>
            ) : (
              <div className="space-y-3">
                {courses.map(course => (
                  <div key={course.id} className={`p-3 rounded-xl border ${course.color} relative group transition-transform hover:-translate-y-1`}>
                     <div className="flex justify-between items-start">
                        <h4 className="font-bold text-base truncate flex-1 ml-2">{course.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                              onClick={() => handleEdit(course)}
                              className="text-indigo-500 hover:bg-white/60 p-1.5 rounded-full transition-all"
                              title="تعديل"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => deleteCourse(course.id)}
                              className="text-red-500 hover:bg-white/60 p-1.5 rounded-full transition-all"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5 text-xs mt-2 opacity-80 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span dir="ltr" className="font-sans">{course.startTime} - {course.endTime}</span>
                     </div>
                     {course.instructor && (
                       <div className="flex items-center gap-1.5 text-xs mt-1 opacity-80">
                          <User className="w-3.5 h-3.5" />
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