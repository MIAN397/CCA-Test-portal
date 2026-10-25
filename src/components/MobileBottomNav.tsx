import React from 'react';
import type { UserProfile } from '../types';
import { Home, Award, FileText, Calendar, User, LogIn, LogOut, Shield, CheckSquare, Layers, BookOpen, DollarSign, Bell, Plus, Users } from 'lucide-react';

interface MobileBottomNavProps {
  userProfile: UserProfile | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  userProfile,
  onOpenLoginModal,
  onLogout,
  activeTab,
  setActiveTab
}) => {
  // Smooth scroll to landing page sections for visitors
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. Visitor / Unauthenticated Bottom Control Bar
  if (!userProfile) {
    return (
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <button 
          type="button"
          onClick={() => scrollToSection('hero-section')} 
          className="mobile-bottom-nav-item"
          aria-label="Home section"
        >
          <Home size={20} />
          <span>Home</span>
        </button>

        <button 
          type="button"
          onClick={() => {
            scrollToSection('test-simulator');
          }} 
          className="mobile-bottom-nav-item"
          aria-label="CBT Test Simulator"
        >
          <Award size={20} />
          <span>CBT Tests</span>
        </button>

        <button 
          type="button"
          onClick={() => {
            scrollToSection('programs');
          }} 
          className="mobile-bottom-nav-item"
          aria-label="Programs"
        >
          <Layers size={20} />
          <span>Programs</span>
        </button>

        <button 
          type="button"
          onClick={onOpenLoginModal} 
          className="mobile-bottom-nav-item active-accent"
          aria-label="Portal Login"
        >
          <LogIn size={20} color="var(--accent-gold)" />
          <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>Portal Login</span>
        </button>
      </nav>
    );
  }

  // 2. Student Dashboard Bottom Control Bar
  if (userProfile.role === 'student') {
    return (
      <nav className="mobile-bottom-nav" aria-label="Student portal navigation">
        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('quizzes')} 
          className={`mobile-bottom-nav-item ${activeTab === 'quizzes' || !activeTab ? 'active' : ''}`}
          aria-label="Online Quizzes"
        >
          <FileText size={20} />
          <span>Quizzes</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          className={`mobile-bottom-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
          aria-label="My Attendance"
        >
          <Calendar size={20} />
          <span>Attendance</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('profile')} 
          className={`mobile-bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          aria-label="Cadet Profile"
        >
          <User size={20} />
          <span>Profile</span>
        </button>

        <button 
          type="button"
          onClick={onLogout} 
          className="mobile-bottom-nav-item text-danger"
          aria-label="Sign Out"
        >
          <LogOut size={20} color="#f87171" />
          <span style={{ color: '#f87171' }}>Exit</span>
        </button>
      </nav>
    );
  }

  // 3. Teacher Dashboard Bottom Control Bar
  if (userProfile.role === 'teacher') {
    return (
      <nav className="mobile-bottom-nav" aria-label="Teacher portal navigation">
        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('create-quiz')} 
          className={`mobile-bottom-nav-item ${activeTab === 'create-quiz' || !activeTab ? 'active' : ''}`}
          aria-label="Create Timed Quiz"
        >
          <Plus size={20} />
          <span>New Test</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('my-quizzes')} 
          className={`mobile-bottom-nav-item ${activeTab === 'my-quizzes' || activeTab === 'quizzes' ? 'active' : ''}`}
          aria-label="My Quizzes"
        >
          <BookOpen size={20} />
          <span>Quizzes</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('monitor')} 
          className={`mobile-bottom-nav-item ${activeTab === 'monitor' || activeTab === 'submissions' ? 'active' : ''}`}
          aria-label="Cadet Grades"
        >
          <Award size={20} />
          <span>Grades</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          className={`mobile-bottom-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
          aria-label="My Attendance"
        >
          <CheckSquare size={20} />
          <span>Attendance</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('salary')} 
          className={`mobile-bottom-nav-item ${activeTab === 'salary' ? 'active' : ''}`}
          aria-label="My Salary"
        >
          <DollarSign size={20} />
          <span>Salary</span>
        </button>

        <button 
          type="button"
          onClick={onLogout} 
          className="mobile-bottom-nav-item text-danger"
          aria-label="Sign Out"
        >
          <LogOut size={20} color="#f87171" />
          <span style={{ color: '#f87171' }}>Exit</span>
        </button>
      </nav>
    );
  }

  // 4. Developer Dashboard Bottom Control Bar
  if (userProfile.role === 'developer') {
    return (
      <nav className="mobile-bottom-nav" aria-label="Developer controls navigation">
        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('controls')} 
          className={`mobile-bottom-nav-item ${activeTab === 'controls' || activeTab === 'analytics' || !activeTab ? 'active' : ''}`}
          aria-label="System Controls"
        >
          <Shield size={20} />
          <span>Controls</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('attendance')} 
          className={`mobile-bottom-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
          aria-label="Attendance Logs"
        >
          <Calendar size={20} />
          <span>Attendance</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('quizzes')} 
          className={`mobile-bottom-nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
          aria-label="Quizzes and Results"
        >
          <BookOpen size={20} />
          <span>Quizzes</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('financials')} 
          className={`mobile-bottom-nav-item ${activeTab === 'financials' ? 'active' : ''}`}
          aria-label="Financials"
        >
          <DollarSign size={20} />
          <span>Finance</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab && setActiveTab('homepage')} 
          className={`mobile-bottom-nav-item ${activeTab === 'homepage' ? 'active' : ''}`}
          aria-label="Main Page Announcements"
        >
          <Bell size={20} />
          <span>News</span>
        </button>

        <button 
          type="button"
          onClick={onLogout} 
          className="mobile-bottom-nav-item text-danger"
          aria-label="Sign Out"
        >
          <LogOut size={20} color="#f87171" />
          <span style={{ color: '#f87171' }}>Exit</span>
        </button>
      </nav>
    );
  }

  // 5. Admin Dashboard Bottom Control Bar
  return (
    <nav className="mobile-bottom-nav" aria-label="Admin administration navigation">
      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('attendance')} 
        className={`mobile-bottom-nav-item ${activeTab === 'attendance' || !activeTab ? 'active' : ''}`}
        aria-label="Attendance Logs"
      >
        <Calendar size={20} />
        <span>Attendance</span>
      </button>

      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('students')} 
        className={`mobile-bottom-nav-item ${activeTab === 'students' ? 'active' : ''}`}
        aria-label="Cadets Directory"
      >
        <Users size={20} />
        <span>Cadets</span>
      </button>

      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('roles')} 
        className={`mobile-bottom-nav-item ${activeTab === 'roles' ? 'active' : ''}`}
        aria-label="User Roles"
      >
        <Award size={20} />
        <span>Roles</span>
      </button>

      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('quizzes')} 
        className={`mobile-bottom-nav-item ${activeTab === 'quizzes' ? 'active' : ''}`}
        aria-label="Quizzes"
      >
        <BookOpen size={20} />
        <span>Quizzes</span>
      </button>

      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('financials')} 
        className={`mobile-bottom-nav-item ${activeTab === 'financials' ? 'active' : ''}`}
        aria-label="Financials"
      >
        <DollarSign size={20} />
        <span>Finance</span>
      </button>

      <button 
        type="button"
        onClick={() => setActiveTab && setActiveTab('homepage')} 
        className={`mobile-bottom-nav-item ${activeTab === 'homepage' ? 'active' : ''}`}
        aria-label="Main Page Announcements"
      >
        <Bell size={20} />
        <span>News</span>
      </button>

      <button 
        type="button"
        onClick={onLogout} 
        className="mobile-bottom-nav-item text-danger"
        aria-label="Sign Out"
      >
        <LogOut size={20} color="#f87171" />
        <span style={{ color: '#f87171' }}>Exit</span>
      </button>
    </nav>
  );
};
