import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserRole,
  Teacher,
  Student,
} from '../types';
import {
  BookOpen,
  BarChart3,
  FileCheck,
  Award,
  Users,
  Layers,
  Database,
  Sliders,
  Sparkles,
  Search,
  X,
  LogOut,
  Plus,
  Shield,
  UserCheck,
  Code,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Radio,
  FileText,
} from 'lucide-react';
import { getDaysRemaining } from '../utils/subscription';
import { getUserSubscription } from '../utils/storage';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentTeacher?: Teacher | null;
  currentStudent?: Student | null;
  googleEmail?: string;
  googlePicture?: string;
  onLogout?: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  pendingSubsCount?: number;
  activeQuizzesCount?: number;
  studentsCount?: number;
  teachersCount?: number;
  onOpenPlanPortal?: () => void;
  onOpenCreateQuiz?: () => void;
  onOpenEnrollStudent?: () => void;
  onOpenRecruitTeacher?: () => void;
  onOpenCreateProfile?: () => void;
  onOpenCumulativeReport?: () => void;
}

interface MenuItemDef {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  badge?: string | number;
  badgeType?: 'default' | 'pulse' | 'gold';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  currentTeacher,
  currentStudent,
  googleEmail,
  googlePicture,
  onLogout,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  pendingSubsCount = 0,
  activeQuizzesCount = 0,
  studentsCount = 0,
  teachersCount = 0,
  onOpenPlanPortal,
  onOpenCreateQuiz,
  onOpenEnrollStudent,
  onOpenRecruitTeacher,
  onOpenCreateProfile,
  onOpenCumulativeReport,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const teacherSub =
    currentTeacher?.subscription ||
    (currentTeacher?.id ? getUserSubscription(currentTeacher.id) : null) ||
    (currentTeacher?.loginId ? getUserSubscription(currentTeacher.loginId) : null);

  const studentSub =
    currentStudent?.subscription ||
    (currentStudent?.id ? getUserSubscription(currentStudent.id) : null) ||
    (currentStudent?.loginId ? getUserSubscription(currentStudent.loginId) : null);

  const activeSub = currentRole === 'teacher' ? teacherSub : currentRole === 'student' ? studentSub : null;

  let daysLeft: number | null = activeSub ? getDaysRemaining(activeSub) : null;
  let totalDuration = activeSub?.durationDays || 30;
  if (daysLeft === null && currentRole === 'teacher' && currentTeacher?.validityDays && currentTeacher.validityDays > 0) {
    totalDuration = currentTeacher.validityDays;
    const startMs = currentTeacher.recruitedAt ? new Date(currentTeacher.recruitedAt).getTime() : Date.now();
    const expMs = startMs + currentTeacher.validityDays * 24 * 60 * 60 * 1000;
    daysLeft = Math.max(0, Math.ceil((expMs - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  const progressPct =
    daysLeft !== null
      ? Math.max(6, Math.min(100, Math.round((daysLeft / Math.max(1, totalDuration)) * 100)))
      : 100;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 5;
  const showValidityCard = currentRole === 'teacher' || (currentRole === 'student' && daysLeft !== null);

  const uniqueTeacherClasses = currentTeacher
    ? Array.from(new Set(currentTeacher.assignments?.map((a) => a.className) || [])).length
    : 0;
  const teacherMaxClasses = currentTeacher?.subscription?.maxClasses ?? currentTeacher?.maxClasses ?? 5;
  const teacherUsedClasses = currentTeacher?.lifetimeClassesCreated ?? uniqueTeacherClasses;

  // Define menu items tailored per role
  const getMenuItems = (): MenuItemDef[] => {
    switch (currentRole) {
      case 'student':
        return [
          {
            id: 'active_tests',
            label: 'Active Tests & Quizzes',
            icon: BookOpen,
            badge: activeQuizzesCount > 0 ? activeQuizzesCount : undefined,
          },
          {
            id: 'mastery',
            label: 'Cadet Mastery & Stats',
            icon: BarChart3,
          },
          {
            id: 'history',
            label: 'Scorecards & Results',
            icon: FileCheck,
          },
        ];

      case 'teacher':
        return [
          {
            id: 'students',
            label: 'Cadet Student Roster',
            icon: Users,
            badge: studentsCount > 0 ? studentsCount : undefined,
          },
          {
            id: 'active_quizzes',
            label: 'Examination Center',
            icon: BookOpen,
            badge: activeQuizzesCount > 0 ? activeQuizzesCount : undefined,
          },
          {
            id: 'quiz_bank',
            label: 'Quiz Bank Archives',
            icon: Layers,
          },
          {
            id: 'analytics',
            label: 'Class Performance',
            icon: BarChart3,
          },
          {
            id: 'submissions',
            label: 'Submissions & Audits',
            icon: Award,
          },
        ];

      case 'admin':
        return [
          {
            id: 'hierarchy',
            label: 'Record Explorer',
            icon: BookOpen,
          },
          {
            id: 'teachers',
            label: 'Teachers Roster',
            icon: Users,
            badge: teachersCount > 0 ? teachersCount : undefined,
          },
          {
            id: 'subscriptions',
            label: 'Plans & Subscriptions',
            icon: Sparkles,
            badge: pendingSubsCount > 0 ? `${pendingSubsCount} TID` : undefined,
            badgeType: pendingSubsCount > 0 ? 'pulse' : undefined,
          },
        ];

      case 'developer':
        return [
          {
            id: 'profiles',
            label: 'All Profiles Console',
            icon: Users,
          },
          {
            id: 'database',
            label: 'Database & Backup Hub',
            icon: Database,
          },
          {
            id: 'config',
            label: 'Academic Config',
            icon: Sliders,
          },
          {
            id: 'subscriptions',
            label: 'Subscriptions & Paywall',
            icon: Sparkles,
            badge: pendingSubsCount > 0 ? `${pendingSubsCount} TID` : undefined,
            badgeType: pendingSubsCount > 0 ? 'pulse' : undefined,
          },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            className="sidebar-mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Shell */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${
          isOpenMobile ? 'sidebar-mobile-open' : ''
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* 1. Header / Brand Bar */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand-group">
              <img
                src="/logo.png"
                alt="Cadets Coaching Academy Crest"
                className="sidebar-crest-img"
              />
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">CCA CADETS</span>
                <span className="sidebar-brand-subtitle">
                  {currentRole === 'developer' && 'Master Developer'}
                  {currentRole === 'admin' && 'Executive Admin'}
                  {currentRole === 'teacher' && 'Faculty Command'}
                  {currentRole === 'student' && 'Cadet Desk'}
                </span>
              </div>
            </div>
          )}

          {/* Desktop Collapse / Mobile Close Button */}
          <div className="sidebar-toggle-wrap">
            {/* Mobile close X */}
            <button
              type="button"
              className="sidebar-btn-mobile-close"
              onClick={onCloseMobile}
              title="Close Menu"
            >
              <X size={19} />
            </button>

            {/* Desktop collapse icon toggle */}
            <button
              type="button"
              className="sidebar-btn-collapse"
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>
        </div>

        {/* 2. Quick Search (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="sidebar-search-container">
            <div className="sidebar-search-box">
              <Search size={14} className="sidebar-search-icon" />
              <input
                type="text"
                placeholder="Quick search..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="sidebar-search-input"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="sidebar-search-clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Utility Quick Bar (Top badges like Inbox/Notifications in sample) */}
        {!isCollapsed && (
          <div className="sidebar-utility-list">
            {/* Live System Sync */}
            <div className="sidebar-utility-btn static-item">
              <div className="utility-label-wrap">
                <Radio size={16} color="#16a34a" />
                <span>Cloud Multi-Sync</span>
              </div>
              <span className="utility-badge badge-live">
                <span className="live-dot" />
                Live
              </span>
            </div>

            {/* Pending Verification Notice for Admin / Dev */}
            {(currentRole === 'admin' || currentRole === 'developer') && pendingSubsCount > 0 && (
              <button
                type="button"
                className="sidebar-utility-btn alert-item"
                onClick={() => handleSelectTab('subscriptions')}
              >
                <div className="utility-label-wrap">
                  <Clock size={16} color="#b45309" />
                  <span>Pending Receipts</span>
                </div>
                <span className="utility-badge badge-pulse">
                  {pendingSubsCount} TID
                </span>
              </button>
            )}
          </div>
        )}

        {/* 4. Menu Section */}
        <div className="sidebar-nav-section">
          {!isCollapsed && <div className="sidebar-section-title">Menu</div>}

          <div className="sidebar-nav-items">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="sidebar-nav-icon">
                    <Icon size={18} />
                  </span>

                  {!isCollapsed && (
                    <span className="sidebar-nav-label">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`sidebar-nav-badge ${
                        item.badgeType === 'pulse'
                          ? 'badge-pulse'
                          : item.badgeType === 'gold'
                          ? 'badge-gold'
                          : ''
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Quick Direct Action Shortcuts (Add Profile, Create Quiz, etc.) */}
        {!isCollapsed && (
          <div className="sidebar-nav-section quick-actions-section">
            <div className="sidebar-section-title">Quick Actions</div>
            <div className="sidebar-nav-items">
              {currentRole === 'teacher' && onOpenCreateQuiz && (
                <button
                  type="button"
                  className="sidebar-quick-action-btn"
                  onClick={() => {
                    onOpenCreateQuiz();
                    if (isOpenMobile) onCloseMobile();
                  }}
                >
                  <Plus size={15} />
                  <span>Create Assessment</span>
                </button>
              )}

              {currentRole === 'teacher' && onOpenEnrollStudent && (
                <button
                  type="button"
                  className="sidebar-quick-action-btn"
                  onClick={() => {
                    onOpenEnrollStudent();
                    if (isOpenMobile) onCloseMobile();
                  }}
                >
                  <Plus size={15} />
                  <span>Enroll New Cadet</span>
                </button>
              )}

              {currentRole === 'admin' && onOpenRecruitTeacher && (
                <button
                  type="button"
                  className="sidebar-quick-action-btn"
                  onClick={() => {
                    onOpenRecruitTeacher();
                    if (isOpenMobile) onCloseMobile();
                  }}
                >
                  <Plus size={15} />
                  <span>Recruit Teacher</span>
                </button>
              )}

              {currentRole === 'developer' && onOpenCreateProfile && (
                <button
                  type="button"
                  className="sidebar-quick-action-btn"
                  onClick={() => {
                    onOpenCreateProfile();
                    if (isOpenMobile) onCloseMobile();
                  }}
                >
                  <Plus size={15} />
                  <span>Add Academy Profile</span>
                </button>
              )}

              {currentRole === 'student' && onOpenCumulativeReport && (
                <button
                  type="button"
                  className="sidebar-quick-action-btn"
                  onClick={() => {
                    onOpenCumulativeReport();
                    if (isOpenMobile) onCloseMobile();
                  }}
                >
                  <FileText size={15} />
                  <span>Cumulative Report</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. Footer / Validity Card & User Profile Card */}
        <div className="sidebar-footer">
          {showValidityCard && (
            !isCollapsed ? (
              <div
                className={`sidebar-validity-card ${
                  daysLeft === null ? 'is-lifetime' : isExpiringSoon ? 'is-warning' : 'is-active'
                }`}
                onClick={onOpenPlanPortal}
                role={onOpenPlanPortal ? 'button' : undefined}
                tabIndex={onOpenPlanPortal ? 0 : undefined}
              >
                <div className="sidebar-validity-header">
                  <div className="sidebar-validity-title-group">
                    <span className="sidebar-validity-icon">
                      {daysLeft === null ? <Sparkles size={13} /> : <Clock size={13} />}
                    </span>
                    <span className="sidebar-validity-title">
                      {activeSub?.planName || (currentRole === 'teacher' ? 'Faculty Pass' : 'Cadet Pass')}
                    </span>
                  </div>
                  <span className="sidebar-validity-badge">
                    {daysLeft !== null
                      ? `${daysLeft}d Left`
                      : 'Lifetime'}
                  </span>
                </div>

                <div className="sidebar-validity-progress-track">
                  <div
                    className="sidebar-validity-progress-fill"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                <div className="sidebar-validity-meta">
                  <span>
                    {currentRole === 'teacher'
                      ? `Quota: ${teacherUsedClasses}/${teacherMaxClasses} Classes`
                      : activeSub?.expiryDate
                      ? `Exp: ${new Date(activeSub.expiryDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : 'Active Membership'}
                  </span>
                  {onOpenPlanPortal && daysLeft !== null && (
                    <span className="sidebar-validity-action">Extend →</span>
                  )}
                  {daysLeft === null && (
                    <span className="sidebar-validity-clearance">Permanent</span>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`sidebar-validity-rail-btn ${
                  daysLeft === null ? 'is-lifetime' : isExpiringSoon ? 'is-warning' : 'is-active'
                }`}
                onClick={onOpenPlanPortal}
                title={
                  daysLeft !== null
                    ? `${daysLeft} Days Remaining (${activeSub?.planName || 'Active Pass'}) • Quota: ${teacherUsedClasses}/${teacherMaxClasses} Classes`
                    : `Lifetime Institutional Pass • Quota: ${teacherUsedClasses}/${teacherMaxClasses} Classes`
                }
              >
                {daysLeft === null ? <Sparkles size={15} /> : <Clock size={15} />}
                <span className="sidebar-validity-rail-text">
                  {daysLeft !== null ? `${daysLeft}d` : '∞'}
                </span>
              </button>
            )
          )}

          <div className="sidebar-user-card">
            <div className="sidebar-user-avatar">
              {googlePicture ? (
                <img
                  src={googlePicture}
                  alt="Avatar"
                  className="sidebar-user-avatar-img"
                />
              ) : currentRole === 'developer' ? (
                <Code size={16} />
              ) : currentRole === 'admin' ? (
                <Shield size={16} />
              ) : currentRole === 'teacher' ? (
                <UserCheck size={16} />
              ) : (
                <GraduationCap size={16} />
              )}
            </div>

            {!isCollapsed && (
              <div className="sidebar-user-meta">
                <span className="sidebar-user-name">
                  {currentRole === 'developer' && 'Master Developer'}
                  {currentRole === 'admin' && 'Executive Admin'}
                  {currentRole === 'teacher' && (currentTeacher?.name || 'Faculty Teacher')}
                  {currentRole === 'student' && (currentStudent?.name || 'Cadet Student')}
                </span>
                <span className="sidebar-user-role">
                  {currentRole === 'developer' && 'Root Control'}
                  {currentRole === 'admin' && 'Academy Head'}
                  {currentRole === 'teacher' && `Faculty • ${currentTeacher?.loginId || ''}`}
                  {currentRole === 'student' && `${currentStudent?.className || 'Class'}`}
                </span>
                {googleEmail && (
                  <span className="sidebar-user-email font-mono">
                    {googleEmail}
                  </span>
                )}
              </div>
            )}

            {!isCollapsed && onLogout && (
              <button
                type="button"
                className="sidebar-btn-logout"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
