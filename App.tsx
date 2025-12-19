
import React, { useState, useEffect, Suspense } from 'react';
import Dashboard from './components/Dashboard';
import ScheduleManager from './components/ScheduleManager';
import TaskManager from './components/TaskManager';
import { Course, Task } from './types';
import { Layout, Calendar, ListTodo, GraduationCap } from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'tasks'>('dashboard');
  
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('courses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 md:pb-8 font-sans transition-all duration-300">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm backdrop-blur-md bg-white/90">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-tight text-slate-800">رفيق الطالب</h1>
                <p className="text-xs text-slate-400 font-medium">خطط بذكاء، انجح بتفوق</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                الرئيسية
             </button>
             <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                جدول المحاضرات
             </button>
             <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                قائمة المهام
             </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 min-h-[calc(100vh-140px)]">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>
          {activeTab === 'dashboard' && (
            <Dashboard courses={courses} tasks={tasks} toggleTask={toggleTask} />
          )}
          {activeTab === 'schedule' && (
            <ScheduleManager courses={courses} setCourses={setCourses} />
          )}
          {activeTab === 'tasks' && (
            <TaskManager tasks={tasks} setTasks={setTasks} courses={courses} />
          )}
        </Suspense>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-3 pb-safe z-50 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'schedule' ? 'text-primary-600 scale-110' : 'text-slate-400'}`}
        >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-bold">الجدول</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-3 -mt-10 rounded-full shadow-xl border-4 border-slate-50 transition-all active:scale-90 ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'bg-white text-slate-400'}`}
        >
            <Layout className="w-7 h-7" />
        </button>

        <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-primary-600 scale-110' : 'text-slate-400'}`}
        >
            <ListTodo className="w-6 h-6" />
            <span className="text-[10px] font-bold">المهام</span>
        </button>
      </div>
    </div>
  );
}

export default App;
