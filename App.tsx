import React, { useState, useEffect, Suspense } from 'react';
import Dashboard from './components/Dashboard';
import ScheduleManager from './components/ScheduleManager';
import TaskManager from './components/TaskManager';
import { Course, Task } from './types';
// Added ChevronRight to imports
import { Layout, Calendar, ListTodo, GraduationCap, Moon, Sun, Settings, Download, Trash2, X, ChevronRight } from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'tasks'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showSettings, setShowSettings] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const exportData = () => {
    const data = { courses, tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const clearAllData = () => {
    if (confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setCourses([]);
      setTasks([]);
      localStorage.clear();
      setShowSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pb-24 md:pb-8 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 py-3 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
                <h1 className="font-bold text-lg leading-tight dark:text-white">رفيق الطالب</h1>
                <p className="text-[10px] text-slate-500 font-medium">نظامك المتكامل للنجاح</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             {(['dashboard', 'schedule', 'tasks'] as const).map((tab) => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
               >
                {tab === 'dashboard' ? 'الرئيسية' : tab === 'schedule' ? 'الجدول' : 'المهام'}
               </button>
             ))}
          </nav>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all"
            >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-all"
            >
                <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 min-h-[calc(100vh-140px)] animate-slide-up">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          {activeTab === 'dashboard' && <Dashboard courses={courses} tasks={tasks} toggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))} />}
          {activeTab === 'schedule' && <ScheduleManager courses={courses} setCourses={setCourses} />}
          {activeTab === 'tasks' && <TaskManager tasks={tasks} setTasks={setTasks} courses={courses} />}
        </Suspense>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">الإعدادات</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button onClick={exportData} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-500" />
                  <span className="font-bold">تصدير البيانات (JSON)</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30" />
              </button>
              <button onClick={clearAllData} className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="font-bold text-red-600 dark:text-red-400">حذف جميع البيانات</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 text-red-400" />
              </button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-400">
              رفيق الطالب الذكي v1.1 • تم التطوير بكل حب
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-10 py-3 pb-safe z-50 flex justify-between items-center">
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'schedule' ? 'text-primary-600' : 'text-slate-400'}`}>
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-bold">الجدول</span>
        </button>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-3.5 -mt-10 rounded-full shadow-xl border-4 border-slate-50 dark:border-slate-950 transition-all ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
            <Layout className="w-7 h-7" />
        </button>
        <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-primary-600' : 'text-slate-400'}`}>
            <ListTodo className="w-6 h-6" />
            <span className="text-[10px] font-bold">المهام</span>
        </button>
      </div>
    </div>
  );
}

export default App;