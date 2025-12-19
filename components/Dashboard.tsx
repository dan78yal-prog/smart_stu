import React, { useEffect, useState } from 'react';
import { Course, Task } from '../types';
import { Clock, CheckCircle, Calendar, Sparkles, BookOpen, AlertCircle, ChevronRight } from './Icons';
import { getDailyMotivation } from '../services/gemini';

interface DashboardProps {
  courses: Course[];
  tasks: Task[];
  toggleTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, tasks, toggleTask }) => {
  const [motivation, setMotivation] = useState<string>('جاري تحضير جرعة التحفيز...');
  
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const todayIndex = new Date().getDay(); 
  const currentDayName = days[todayIndex]; 

  const getTodayDateStr = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };
  const todayStr = getTodayDateStr();

  const todaysCourses = courses.filter(c => c.day === currentDayName).sort((a,b) => a.startTime.localeCompare(b.startTime));
  
  // Find Next Class
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const nextCourse = todaysCourses.find(c => c.startTime > currentTime);

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  useEffect(() => {
    getDailyMotivation(pendingTasks.length).then(setMotivation);
  }, [pendingTasks.length]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Welcome & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold mb-3">أهلاً بك مجدداً! 🚀</h1>
              <p className="opacity-90 text-sm md:text-lg max-w-xl leading-relaxed font-medium italic">
                "{motivation}"
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6 relative z-10">
                <div className="flex-1">
                    <div className="flex justify-between text-xs mb-2 opacity-80 font-bold">
                        <span>إجمالي التقدم في المهام</span>
                        <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>
            <Sparkles className="absolute -top-6 -left-6 w-32 h-32 text-white opacity-10 rotate-12" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm mb-4 uppercase tracking-wider">المحاضرة القادمة</h3>
            {nextCourse ? (
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${nextCourse.color} shadow-sm`}>
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg dark:text-white leading-tight">{nextCourse.name}</h4>
                            <p dir="ltr" className="text-sm text-primary-600 dark:text-primary-400 font-bold mt-1">{nextCourse.startTime}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        <span>تبدأ خلال وقت قصير، كن مستعداً!</span>
                    </div>
                </div>
            ) : (
                <div className="text-center py-4">
                    <p className="text-slate-400 text-sm">لا توجد محاضرات متبقية لهذا اليوم</p>
                </div>
            )}
          </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Timeline */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    جدول اليوم
                </h2>
                <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">{currentDayName}</span>
            </div>
            
            {todaysCourses.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <p>يوم هادئ.. لا توجد محاضرات اليوم ☕</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {todaysCourses.map((course, idx) => {
                        const isPast = course.endTime < currentTime;
                        const isCurrent = currentTime >= course.startTime && currentTime <= course.endTime;

                        return (
                            <div key={idx} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between
                                ${isCurrent ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 scale-[1.02] shadow-md' : 'border-transparent bg-slate-50 dark:bg-slate-800/40'}
                                ${isPast ? 'opacity-40 grayscale-[0.5]' : ''}
                            `}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-10 rounded-full ${course.color.split(' ')[0]}`}></div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white">{course.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span dir="ltr">{course.startTime} - {course.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                {isCurrent && <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">مباشر الآن</span>}
                            </div>
                        );
                    })}
                </div>
            )}
          </section>

          {/* Pending Tasks */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-secondary-500" />
                    المهام العاجلة
                </h2>
                <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">{pendingTasks.length} مهام</span>
            </div>
            
            {pendingTasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>أنت مبدع! لا توجد مهام متبقية</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingTasks.slice(0, 5).map(task => (
                        <div key={task.id} className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                            <button 
                                onClick={() => toggleTask(task.id)} 
                                className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-secondary-500 transition-colors"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 dark:text-white truncate">{task.title}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">{task.dueDate === todayStr ? 'مستحق اليوم' : task.dueDate}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                    {pendingTasks.length > 5 && (
                        <p className="text-center text-xs text-slate-400 mt-2">+{pendingTasks.length - 5} مهام أخرى متبقية</p>
                    )}
                </div>
            )}
          </section>
      </div>
    </div>
  );
};

export default Dashboard;