import React, { useState, useMemo } from 'react';
import { Course, Task } from '../types';
// Added ListTodo and X to imports
import { Sparkles, Plus, CheckCircle, Trash2, BookOpen, Calendar, Clock, Pencil, XCircle, AlertCircle, Search, Filter, ListTodo, X } from './Icons';
import { generateTaskBreakdown } from '../services/gemini';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  courses: Course[];
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, courses }) => {
  const getTodayDate = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<Partial<Task>>({ priority: 'medium', dueDate: getTodayDate() });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed'>('all');

  const [loadingAI, setLoadingAI] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [currentAiTask, setCurrentAiTask] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' ? true : filterType === 'pending' ? !t.completed : t.completed;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
        const prio = { high: 3, medium: 2, low: 1 };
        return prio[b.priority] - prio[a.priority];
      });
  }, [tasks, searchTerm, filterType]);

  const handleSubmit = () => {
    if (!formData.title || !formData.dueDate) return;
    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? { ...t, ...formData } as Task : t));
      setEditingId(null);
    } else {
      const task: Task = { id: Math.random().toString(36).substr(2, 9), completed: false, ...formData } as Task;
      setTasks([...tasks, task]);
    }
    setFormData({ priority: 'medium', dueDate: getTodayDate(), title: '', courseId: '' });
  };

  const handleAskAI = async (title: string, courseId?: string) => {
    setLoadingAI(true);
    setAiModalOpen(true);
    setCurrentAiTask(title);
    try {
      const cName = courses.find(c => c.id === courseId)?.name || "عامة";
      const result = await generateTaskBreakdown(title, cName);
      setAiResult(result);
    } catch (e) {
      setAiResult({ motivation: "حدث خطأ!", steps: ["حاول لاحقاً"], estimatedTime: "--" });
    } finally { setLoadingAI(false); }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Form */}
      <div className={`p-6 rounded-3xl border shadow-sm transition-all ${editingId ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/10' : 'bg-white dark:bg-slate-900 dark:border-slate-800'}`}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-white">
          {editingId ? <Pencil className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-primary-500" />}
          {editingId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
        </h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input type="text" placeholder="ما هي مهمتك القادمة؟" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="flex-1 p-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 outline-none" />
            <button onClick={() => handleAskAI(formData.title!, formData.courseId)} disabled={!formData.title} className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 p-4 rounded-2xl hover:bg-purple-200 transition-colors disabled:opacity-50"><Sparkles className="w-6 h-6" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={formData.courseId || ''} onChange={e => setFormData({ ...formData, courseId: e.target.value })} className="p-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                <option value="">بدون مادة</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="p-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
            <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as any })} className="p-4 rounded-2xl border dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
                <option value="high">عاجل جداً</option>
                <option value="medium">أولوية متوسطة</option>
                <option value="low">أولوية منخفضة</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={!formData.title} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50">{editingId ? 'حفظ التعديل' : 'إضافة المهمة'}</button>
            {editingId && <button onClick={() => { setEditingId(null); setFormData({ priority: 'medium', dueDate: getTodayDate() }); }} className="bg-slate-200 dark:bg-slate-800 px-6 rounded-2xl font-bold">إلغاء</button>}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="ابحث في المهام..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-4 pr-12 rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800 w-full md:w-auto">
            {(['all', 'pending', 'completed'] as const).map(type => (
                <button key={type} onClick={() => setFilterType(type)} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${filterType === type ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                    {type === 'all' ? 'الكل' : type === 'pending' ? 'قيد التنفيذ' : 'المكتملة'}
                </button>
            ))}
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListTodo className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">لا توجد مهام مطابقة للبحث</p>
            </div>
        ) : (
            filteredTasks.map(task => {
                const isOverdue = !task.completed && new Date(task.dueDate) < new Date(getTodayDate());
                const course = courses.find(c => c.id === task.courseId);

                return (
                    <div key={task.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group
                        ${task.completed ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent grayscale' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-lg'}
                        ${isOverdue ? 'border-r-4 border-r-red-500' : ''}
                    `}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}>
                                {task.completed && <CheckCircle className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold truncate dark:text-white ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {course && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg bg-opacity-10 border border-opacity-20 ${course.color.replace('bg-', 'text-').replace('text-', 'bg-')}`}>{course.name}</span>}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                        <Calendar className="w-3 h-3" /> {task.dueDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setFormData(task); setEditingId(task.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500"><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => confirm('حذف المهمة؟') && setTasks(tasks.filter(t => t.id !== task.id))} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* AI Modal (Same as before but with Dark Mode Support) */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-l from-purple-600 to-indigo-700 p-8 text-white">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-bold flex items-center gap-3"><Sparkles className="w-6 h-6 text-yellow-300" />مساعد الذكاء الاصطناعي</h3>
                        <button onClick={() => setAiModalOpen(false)} className="bg-white/20 p-1 rounded-full"><X className="w-6 h-6" /></button>
                    </div>
                </div>
                <div className="p-8">
                    {loadingAI ? (
                        <div className="flex flex-col items-center py-10 gap-6">
                            <div className="w-14 h-14 border-4 border-slate-100 dark:border-slate-800 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">جاري التخطيط لنجاحك...</p>
                        </div>
                    ) : aiResult ? (
                        <div className="space-y-6">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl text-purple-800 dark:text-purple-300 italic">" {aiResult.motivation} "</div>
                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {aiResult.steps.map((s: string, i: number) => (
                                    <div key={i} className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                                        <div className="w-6 h-6 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">{i+1}</div>
                                        <p className="text-sm dark:text-slate-200">{s}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { 
                                const stps = aiResult.steps.map((s:string) => ({ id: Math.random().toString(), title: `${currentAiTask}: ${s}`, completed: false, dueDate: formData.dueDate, priority: 'medium' }));
                                setTasks([...tasks, ...stps]);
                                setAiModalOpen(false);
                            }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">إضافة هذه الخطوات كمهام</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;