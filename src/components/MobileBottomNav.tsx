import React from 'react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import {
  Users,
  Layers,
  BookOpen,
  BarChart3,
  Award,
  FileCheck,
  Database,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItemDef {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRole,
  activeTab,
  onTabChange,
}) => {
  const getNavItems = (): NavItemDef[] => {
    switch (currentRole) {
      case 'student':
        return [
          { id: 'active_tests', label: 'My Tests', icon: BookOpen },
          { id: 'mastery', label: 'Mastery', icon: BarChart3 },
          { id: 'history', label: 'Scorecards', icon: FileCheck },
        ];
      case 'teacher':
        return [
          { id: 'students', label: 'Cadets', icon: Users },
          { id: 'quiz_bank', label: 'Bank', icon: Layers },
          { id: 'active_quizzes', label: 'Tests', icon: BookOpen },
          { id: 'analytics', label: 'Stats', icon: BarChart3 },
          { id: 'submissions', label: 'Audits', icon: Award },
        ];
      case 'admin':
        return [
          { id: 'hierarchy', label: 'Hierarchy', icon: BookOpen },
          { id: 'teachers', label: 'Teachers', icon: Users },
          { id: 'subscriptions', label: 'Plans', icon: Sparkles },
        ];
      case 'developer':
        return [
          { id: 'profiles', label: 'Profiles', icon: Users },
          { id: 'database', label: 'Database', icon: Database },
          { id: 'config', label: 'Config', icon: Sliders },
          { id: 'subscriptions', label: 'Plans', icon: Sparkles },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  if (navItems.length === 0) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              {/* Sliding Active Pill Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeMobilePill"
                  className="mobile-nav-active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 34,
                  }}
                />
              )}

              <span className="mobile-nav-icon-wrap">
                <Icon size={19} />
              </span>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


