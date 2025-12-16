import React, { useEffect, useState } from 'react';
import { Course, Task, DayOfWeek } from '../types';
import { Clock, CheckCircle, Calendar, Sparkles } from './Icons';
import { getDailyMotivation } from '../services/gemini';

interface DashboardProps {
  courses: Course[];
  tasks: Task[];
  toggleTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, tasks, toggleTask }) => {
  const [motivation, setMotivation] = useState<string>('جاري تحضير جرعة التحفيز...');
  
  // Determine current day
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const todayIndex = new Date().getDay(); 
  const currentDayName = days[todayIndex]; 

  const todaysCourses = courses.filter(c => c.day === currentDayName).sort((a,b) => a.startTime.localeCompare(b.startTime));
  
  const pendingTasks = tasks.filter(t => !t.completed).length;
  const todaysTasks = tasks.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return t.dueDate === today && !t.completed;
  });

  useEffect(() => {
    getDailyMotivation(pendingTasks).then(setMotivation);
  }, [pendingTasks]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">أهلاً بك يا بطل! 👋</h1>
          <p className="opacity-90 text-sm md:text-base max-w-xl leading-relaxed">
            {motivation}
          </p>
        </div>
        <Sparkles className="absolute top-4 left-4 w-24 h-24 text-white opacity-10 rotate-12" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-primary-600 mb-1">{todaysCourses.length}</span>
            <span className="text-slate-500 text-sm font-medium">محاضرات اليوم</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-secondary-600 mb-1">{pendingTasks}</span>
            <span className="text-slate-500 text-sm font-medium">مهام متبقية</span>
        </div>
      </div>

      {/* Today's Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                جدول اليوم ({currentDayName})
            </h2>
        </div>
        
        {todaysCourses.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                <p>يوم حر! لا توجد محاضرات اليوم.</p>
            </div>
        ) : (
            <div className="relative border-r-2 border-slate-200 mr-3 pr-4 py-2 space-y-6">
                {todaysCourses.map((course, idx) => (
                    <div key={idx} className="relative">
                        <div className={`absolute top-2 -right-[23px] w-4 h-4 rounded-full border-2 border-white ring-2 ${course.color.replace('bg-', 'ring-').split(' ')[0]} bg-white`}></div>
                        <div className={`p-4 rounded-xl border-r-4 shadow-sm ${course.color.replace('bg-', 'border-').split(' ')[0]} bg-slate-50`}>
                            <h3 className="font-bold text-slate-800">{course.name}</h3>
                            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.startTime} - {course.endTime}</span>
                                {course.location && <span>📍 {course.location}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Today's Tasks Priority */}
      {todaysTasks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-red-500" />
                مستحق اليوم
            </h2>
            <div className="space-y-3">
                {todaysTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-full border-2 border-red-300 hover:bg-red-200 transition-colors"></button>
                        <span className="font-medium text-slate-700">{task.title}</span>
                    </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;