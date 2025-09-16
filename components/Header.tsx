/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { HomeIcon, TrophyIcon, UserIcon } from './icons';

interface HeaderProps {
    currentView: 'dashboard' | 'leaderboard' | 'quiz' | 'profile' | 'hospital-map' | 'role-selector';
    onNavigate: (view: 'dashboard' | 'leaderboard' | 'profile' | 'hospital-map' | 'role-selector') => void;
    score: number;
    levelName: string;
    userAvatar: string;
}

const renderAvatar = (avatar: string) => {
    if (avatar.startsWith('data:image')) {
        return <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-400/40" />;
    }
    return (
        <span className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full text-2xl border-2 border-white shadow-md ring-2 ring-blue-400/40">
            {avatar}
        </span>
    );
};


const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, score, levelName, userAvatar }) => {
  return (
    <header className="w-full py-3 px-4 sm:px-8 border-b border-gray-200/50 bg-white/60 backdrop-blur-lg glass-header sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                Clinic<span className="text-blue-500 brand-glow">Quest</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <div className="font-bold text-gray-800 text-sm">{levelName}</div>
                    <div className="font-semibold text-gray-500 text-xs">{score.toLocaleString()} PTS</div>
                </div>
                {renderAvatar(userAvatar)}
            </div>

            <nav className="flex items-center gap-2 pl-4 border-l border-gray-200">
                <button 
                    onClick={() => onNavigate('dashboard')} 
                    className={`btn btn-nav shine-on-hover ${['dashboard', 'quiz', 'hospital-map', 'role-selector'].includes(currentView) ? 'active' : ''}`}
                    aria-label="Go to Dashboard"
                >
                    <HomeIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Dashboard</span>
                </button>
                <button 
                    onClick={() => onNavigate('leaderboard')} 
                    className={`btn btn-nav shine-on-hover ${currentView === 'leaderboard' ? 'active' : ''}`}
                    aria-label="Go to Leaderboard"
                >
                    <TrophyIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Leaderboard</span>
                </button>
                <button 
                    onClick={() => onNavigate('profile')} 
                    className={`btn btn-nav shine-on-hover ${currentView === 'profile' ? 'active' : ''}`}
                    aria-label="Go to Profile"
                >
                    <UserIcon className="w-5 h-5 md:mr-2" />
                    <span className="hidden md:inline">Profile</span>
                </button>
            </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
