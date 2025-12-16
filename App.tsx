import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ScheduleManager from './components/ScheduleManager';
import TaskManager from './components/TaskManager';
import { Course, Task } from './types';
import { Layout, Calendar, ListTodo, GraduationCap } from './components/Icons';

function App() {
  // State initialization with localStorage persistence
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedule' | 'tasks'>('dashboard');
  
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 md:pb-0 font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
                <h1 className="font-bold text-lg leading-tight text-slate-800">رفيق الطالب</h1>
                <p className="text-xs text-slate-400 font-medium">نظم وقتك، حقق أهدافك</p>
            </div>
          </div>
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
             <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                الرئيسية
             </button>
             <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'schedule' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                الجدول
             </button>
             <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                المهام
             </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard courses={courses} tasks={tasks} toggleTask={toggleTask} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleManager courses={courses} setCourses={setCourses} />
        )}
        {activeTab === 'tasks' && (
          <TaskManager tasks={tasks} setTasks={setTasks} courses={courses} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-safe z-50 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'schedule' ? 'text-primary-600 bg-primary-50' : 'text-slate-400'}`}
        >
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-bold">الجدول</span>
        </button>
        
        <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 p-3 -mt-8 rounded-full shadow-lg border-4 border-slate-50 transition-transform active:scale-95 ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'bg-white text-slate-400'}`}
        >
            <Layout className="w-6 h-6" />
        </button>

        <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${activeTab === 'tasks' ? 'text-primary-600 bg-primary-50' : 'text-slate-400'}`}
        >
            <ListTodo className="w-6 h-6" />
            <span className="text-[10px] font-bold">المهام</span>
        </button>
      </div>
    </div>
  );
}

export default App;