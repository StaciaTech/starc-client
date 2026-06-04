import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEnrolledCourses } from '@/services/profileService';
import { getMyCourses, type ULearnCourse } from '@/services/ulearnService';
import DashboardCard from './DashboardCard';
import {
  Sparkles, BookOpen, Zap, Flame, Trophy, Clock,
  ChevronRight, Plus, Loader2, Lock, CheckCircle,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  duration: string;
  progress: number;
  image: string;
  status: string;
}

// ─── Example topics shown on the "Start Learning" screen ──────────────────────
const EXAMPLE_TOPICS = [
  'Machine Learning', 'Python', 'Web3 & Blockchain',
  'Cloud with AWS', 'Data Structures', 'React Advanced',
];

// ─── Mini ULearn Course Card ──────────────────────────────────────────────────
const ULearnCard: React.FC<{ course: ULearnCourse; onClick: () => void }> = ({ course, onClick }) => {
  const total = course.modules?.reduce((a, m) => a + (m.chapters?.length || 0), 0) || 0;
  const done = course.completedChapterIds?.length || 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    generating_structure: 'text-blue-600 bg-blue-50 border-blue-200',
    generating_content: 'text-purple-600 bg-purple-50 border-purple-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
  };
  const statusLabels: Record<string, string> = {
    pending: 'Queued', generating_structure: 'Building…',
    generating_content: 'Writing…', completed: 'Ready', failed: 'Failed',
  };

  return (
    <div
      onClick={onClick}
      className="rounded-[20px] bg-white shadow-lg overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-200 border border-gray-100 hover:border-[#8A63FF]/30 lg:h-[255px] lg:w-[160px] xl:h-[295px] xl:w-[213px] 2xl:h-[305px] 2xl:w-[240px] 3xl:w-[309px] 3xl:h-[335px] flex justify-center items-center mb-4"
    >
      <div className="lg:w-[155px] lg:h-[245px] xl:w-[195px] xl:h-[275px] 2xl:w-[219px] 2xl:h-[285px] 3xl:w-[269px] 3xl:h-[295px] p-3 flex flex-col">
        {/* Color block replacing image */}
        <div className="rounded-lg bg-gradient-to-br from-[#8A63FF]/20 to-[#7c3aed]/30 flex items-center justify-center lg:h-[105px] xl:h-[130px] 2xl:h-[150px] 3xl:h-[50%] w-full mb-3">
          <Sparkles className="w-8 h-8 text-[#8A63FF]" />
        </div>

        {/* Title */}
        <h3 className="font-semibold lg:text-[12px] xl:text-[13px] 2xl:text-[14px] text-gray-900 line-clamp-2 mb-1">{course.title}</h3>

        {/* Status badge */}
        <span className={`text-[10px] border px-1.5 py-0.5 rounded-full w-fit mb-2 ${statusColors[course.generationStatus] || statusColors.pending}`}>
          {statusLabels[course.generationStatus] || 'Loading'}
        </span>

        {/* Gamification Stats */}
        {course.generationStatus === 'completed' && (
          <div className="flex flex-wrap gap-1 mb-2 mt-1">
            <span className="flex items-center gap-0.5 text-[9px] xl:text-[10px] text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-full font-medium" title="Level"><Trophy className="w-2.5 h-2.5" /> Lvl {course.level || 1}</span>
            <span className="flex items-center gap-0.5 text-[9px] xl:text-[10px] text-[#8A63FF] bg-purple-50 px-1.5 py-0.5 rounded-full font-medium" title="XP"><Zap className="w-2.5 h-2.5" /> {course.xp || 0} XP</span>
            <span className="flex items-center gap-0.5 text-[9px] xl:text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full font-medium" title="Streak"><Flame className="w-2.5 h-2.5" /> {course.streak || 1}d</span>
          </div>
        )}

        {/* Progress */}
        <div className="mt-auto">
          <div className="w-full bg-gray-200 rounded-full h-[6px] mb-1">
            <div className="bg-[#8A63FF] h-[6px] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-500 lg:text-[9px] xl:text-[10px]">{done}/{total} chapters</p>
            <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#8A63FF] transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── Start Learning Panel ──────────────────────────────────────────────────────
const StartLearningPanel: React.FC<{ onStart: (topic: string) => void }> = ({ onStart }) => {
  const [topic, setTopic] = useState('');

  return (
    <div className="bg-white rounded-[20px] shadow-md p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-[#8A63FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-[#8A63FF]" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Start AI Learning</h3>
      <p className="text-gray-500 text-sm mb-6">
        Tell us what you want to learn. Our AI will test your knowledge and build a personalised course just for you.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && topic.trim() && onStart(topic.trim())}
          placeholder="e.g. Machine Learning, React, AWS…"
          className="flex-1 border border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8A63FF] focus:border-transparent"
          autoFocus
        />
        <button
          onClick={() => topic.trim() && onStart(topic.trim())}
          className="bg-[#8A63FF] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#7c3aed] transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Start
        </button>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {EXAMPLE_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => onStart(t)}
            className="bg-gray-100 hover:bg-[#8A63FF]/10 hover:text-[#8A63FF] hover:border-[#8A63FF]/30 border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full transition-all"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const EnrolledCourses: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'supervised' | 'unsupervised'>('supervised');

  // Supervised state
  const [supervisedCourses, setSupervisedCourses] = useState<Course[]>([]);
  const [supervisedLoading, setSupervisedLoading] = useState(true);
  const [supervisedError, setSupervisedError] = useState<string | null>(null);

  // Unsupervised state
  const [uLearnCourses, setULearnCourses] = useState<ULearnCourse[]>([]);
  const [uLearnLoading, setULearnLoading] = useState(false);
  const [uLearnLoaded, setULearnLoaded] = useState(false);

  // ── Load supervised courses on mount ────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEnrolledCourses();
        setSupervisedCourses(data || []);
      } catch {
        setSupervisedError('Failed to load courses.');
        setSupervisedCourses([]);
      } finally {
        setSupervisedLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Load ULearn data lazily when tab switches ────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'unsupervised' || uLearnLoaded) return;
    const fetch = async () => {
      setULearnLoading(true);
      try {
        const courses = await getMyCourses();
        setULearnCourses(courses);
        setULearnLoaded(true);
      } catch {
        setULearnLoaded(true); // still mark as loaded so we show empty state
      } finally {
        setULearnLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  const handleStartLearnig = (topic: string) => {
    navigate('/learn/diagnostic', { state: { topic } });
  };

  const handleCourseClick = (course: ULearnCourse) => {
    if (['pending', 'generating_structure', 'generating_content'].includes(course.generationStatus)) {
      navigate(`/learn/generating/${course._id}`, { state: { topic: course.topic } });
    } else {
      navigate(`/learn/course/${course._id}`);
    }
  };

  // Demo supervised data
  const demoCourses: Course[] = [
    { id: '1', image: '/src/Assets/icons/course1.svg', title: 'AWS Solutions Architect', progress: 50, duration: '1 Month', status: '50%' },
    { id: '2', image: '/src/Assets/icons/course2.svg', title: 'Azure Fundamentals', progress: 100, duration: '1 Month', status: 'Completed' },
    { id: '3', image: '/src/Assets/icons/course3.svg', title: 'Google Cloud Basics', progress: 75, duration: '1 Month', status: '75%' },
  ];
  const supervisedToDisplay = supervisedCourses.length > 0 ? supervisedCourses : demoCourses;

  return (
    <div className="w-full px-6 py-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        {activeTab === 'supervised' && (
          <select className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#8A63FF] text-sm">
            <option value="all">All Courses</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        )}
        {activeTab === 'unsupervised' && uLearnLoaded && (
          <button
            onClick={() => navigate('/learn/my-courses')}
            className="text-[#8A63FF] text-sm font-medium hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('supervised')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'supervised'
              ? 'bg-white text-[#8A63FF] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Supervised
        </button>
        <button
          onClick={() => setActiveTab('unsupervised')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'unsupervised'
              ? 'bg-white text-[#8A63FF] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Learning
          <span className="text-[10px] bg-[#8A63FF] text-white px-1.5 py-0.5 rounded-full">NEW</span>
        </button>
      </div>

      {/* ── SUPERVISED TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'supervised' && (
        <>
          {supervisedLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#8A63FF] animate-spin" />
            </div>
          ) : supervisedError ? (
            <div>
              <div className="text-amber-500 text-center mb-4 text-sm">{supervisedError}</div>
              <div className="flex flex-wrap gap-4">
                {demoCourses.map((c) => <DashboardCard key={c.id} course={c} />)}
              </div>
            </div>
          ) : supervisedToDisplay.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[20px] shadow">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No Courses Yet</h3>
              <p className="text-gray-400 text-sm">You haven't enrolled in any courses yet.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {supervisedToDisplay.map((c) => <DashboardCard key={c.id} course={c} />)}
            </div>
          )}
        </>
      )}

      {/* ── UNSUPERVISED / AI LEARNING TAB ─────────────────────────────────── */}
      {activeTab === 'unsupervised' && (
        <>
          {uLearnLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 text-[#8A63FF] animate-spin" />
              <p className="text-gray-400 text-sm">Loading your AI courses…</p>
            </div>
          ) : (
            <>
              {/* User courses */}

              {uLearnCourses.length === 0 ? (
                <StartLearningPanel onStart={handleStartLearnig} />
              ) : (
                <>
                  {/* Start New Course button row */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">{uLearnCourses.length} AI-generated course{uLearnCourses.length > 1 ? 's' : ''}</p>
                    <button
                      onClick={() => navigate('/learn/diagnostic', { state: { topic: '' } })}
                      className="bg-[#8A63FF] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#7c3aed] transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> New Course
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {uLearnCourses.map((course) => (
                      <ULearnCard
                        key={course._id}
                        course={course}
                        onClick={() => handleCourseClick(course)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EnrolledCourses;