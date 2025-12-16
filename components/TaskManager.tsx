import React, { useState } from 'react';
import { Course, Task } from '../types';
import { Sparkles, Plus, CheckCircle, Trash2, BookOpen, Calendar, Clock } from './Icons';
import { generateTaskBreakdown } from '../services/gemini';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  courses: Course[];
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, courses }) => {
  const [newTask, setNewTask] = useState<Partial<Task>>({
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<{motivation: string, steps: string[], estimatedTime: string} | null>(null);
  const [currentAiTask, setCurrentAiTask] = useState<string>('');

  const addTask = (taskToAdd: Partial<Task> = newTask) => {
    if (!taskToAdd.title || !taskToAdd.dueDate) return;

    const task: Task = {
      id: Date.now().toString() + Math.random(),
      title: taskToAdd.title,
      dueDate: taskToAdd.dueDate,
      courseId: taskToAdd.courseId,
      completed: false,
      priority: taskToAdd.priority || 'medium',
    };

    setTasks([...tasks, task]);
    // Only reset form if it came from the main input
    if (taskToAdd === newTask) {
        setNewTask({ ...newTask, title: '', courseId: '' });
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAskAI = async (taskTitle: string, courseId?: string) => {
    if (!taskTitle) return;
    setLoadingAI(true);
    setAiModalOpen(true);
    setCurrentAiTask(taskTitle);
    
    try {
      const courseName = courses.find(c => c.id === courseId)?.name || "عام";
      const result = await generateTaskBreakdown(taskTitle, courseName);
      setAiResult(result);
    } catch (error) {
      console.error(error);
      setAiResult({
          motivation: "عذراً، حدث خطأ في الاتصال بالمساعد الذكي.",
          steps: ["حاول مرة أخرى لاحقاً"],
          estimatedTime: "--"
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const addAiStepsAsTasks = () => {
    if (!aiResult) return;
    const newTasks = aiResult.steps.map(step => ({
        id: Date.now().toString() + Math.random(),
        title: `${currentAiTask}: ${step}`,
        dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
        courseId: newTask.courseId,
        completed: false,
        priority: 'medium' as const,
    }));
    setTasks([...tasks, ...newTasks]);
    setAiModalOpen(false);
    setAiResult(null);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
         <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-secondary-600" />
          إدارة المهام والواجبات
        </h2>
        
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="ما الذي تريد إنجازه؟ (مثال: حل واجب الرياضيات صـ ٥٠)"
                    value={newTask.title || ''}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                 <button
                    onClick={() => handleAskAI(newTask.title || '', newTask.courseId)}
                    disabled={!newTask.title}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    title="اطلب مساعدة الذكاء الاصطناعي لتقسيم المهمة"
                >
                    <Sparkles className="w-5 h-5" />
                    <span className="hidden md:inline">مساعدة ذكية</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                    value={newTask.courseId || ''}
                    onChange={e => setNewTask({...newTask, courseId: e.target.value})}
                    className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white"
                >
                    <option value="">مهام عامة / بدون مادة</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                    className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <select
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    className="p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white"
                >
                    <option value="high">أولوية عالية</option>
                    <option value="medium">أولوية متوسطة</option>
                    <option value="low">أولوية منخفضة</option>
                </select>
            </div>

            <button
                onClick={() => addTask()}
                className="bg-secondary-600 hover:bg-secondary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-secondary-500/30 flex justify-center items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                إضافة المهمة
            </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>لا توجد مهام حالياً. استمتع بوقتك!</p>
            </div>
        ) : (
            tasks.sort((a,b) => Number(a.completed) - Number(b.completed)).map(task => {
                const course = courses.find(c => c.id === task.courseId);
                return (
                    <div key={task.id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all ${task.completed ? 'opacity-50 bg-slate-50' : 'hover:shadow-md'}`}>
                        <div className="flex items-center gap-4 flex-1">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-secondary-500'}`}
                            >
                                {task.completed && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1">
                                <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {task.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-xs mt-1">
                                    {course && (
                                        <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${course.color.replace('bg-', 'text-').replace('text-', 'bg-opacity-10 ')}`}>
                                            <BookOpen className="w-3 h-3" />
                                            {course.name}
                                        </span>
                                    )}
                                    <span className="text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                                        <Calendar className="w-3 h-3" />
                                        {task.dueDate}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
                                        {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'عادي' : 'منخفض'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                );
            })
        )}
      </div>

      {/* AI Modal */}
      {aiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                  <div className="bg-gradient-to-l from-purple-600 to-indigo-600 p-6 text-white">
                      <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-yellow-300" />
                              مساعد الدراسة الذكي
                          </h3>
                          <button onClick={() => setAiModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full"><Plus className="w-6 h-6 rotate-45" /></button>
                      </div>
                  </div>
                  
                  <div className="p-6">
                      {loadingAI ? (
                          <div className="flex flex-col items-center justify-center py-8 gap-4">
                              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                              <p className="text-slate-500 animate-pulse">جاري تحليل المهمة وبناء الخطة...</p>
                          </div>
                      ) : aiResult ? (
                          <div className="space-y-4">
                              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-800 text-sm">
                                  💡 {aiResult.motivation}
                              </div>
                              <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
                                  <span>الخطوات المقترحة:</span>
                                  <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {aiResult.estimatedTime}</span>
                              </div>
                              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                  {aiResult.steps.map((step, idx) => (
                                      <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100 shrink-0">
                                              {idx + 1}
                                          </div>
                                          <p className="text-slate-700 text-sm">{step}</p>
                                      </div>
                                  ))}
                              </div>
                              <button 
                                onClick={addAiStepsAsTasks}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-4 flex justify-center items-center gap-2 transition-colors"
                              >
                                  <Plus className="w-5 h-5" />
                                  إضافة الخطوات كمهام فرعية
                              </button>
                          </div>
                      ) : (
                          <div className="text-center text-red-500">حدث خطأ، يرجى المحاولة مرة أخرى</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TaskManager;