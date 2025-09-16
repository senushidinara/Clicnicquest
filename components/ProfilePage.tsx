/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AvatarConfig, Badge } from '../types/game';
import { UserIcon, SparklesIcon, TrophyIcon, FireIcon } from './icons';

interface ProfilePageProps {
  user: User;
  onAvatarUpdate: (config: AvatarConfig) => void;
  onUsernameUpdate: (username: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onAvatarUpdate,
  onUsernameUpdate
}) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(user.username);
  const [tempAvatarConfig, setTempAvatarConfig] = useState<AvatarConfig>(user.avatarConfig);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'stats'>('overview');
  const handleTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order: Array<'overview' | 'badges' | 'stats'> = ['overview', 'badges', 'stats'];
    const idx = order.indexOf(selectedTab);
    if (e.key === 'ArrowRight') {
      setSelectedTab(order[(idx + 1) % order.length]);
    } else if (e.key === 'ArrowLeft') {
      setSelectedTab(order[(idx - 1 + order.length) % order.length]);
    }
  };

  const skinTones = ['👤', '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿', '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿'];
  const hairStyles = ['🦲', '👨‍🦲', '👨‍🦱', '👨‍🦳', '👨‍🦰', '👩‍🦲', '👩‍🦱', '👩‍🦳', '👩‍🦰'];
  const outfits = ['👔', '🥼', '👕', '👗', '🦺', '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬'];
  const accessories = ['👓', '🕶️', '⌚', '💍', '🎩', '👑', '🎀', '🧢'];
  const expressions = ['happy', 'focused', 'tired', 'excited'] as const;

  const handleSaveAvatar = () => {
    onAvatarUpdate(tempAvatarConfig);
    setIsEditingAvatar(false);
  };

  const handleSaveUsername = () => {
    if (tempUsername.trim()) {
      onUsernameUpdate(tempUsername.trim());
      setIsEditingUsername(false);
    }
  };

  const getBadgesByRarity = () => {
    const grouped = user.badges.reduce((acc, badge) => {
      if (!acc[badge.rarity]) acc[badge.rarity] = [];
      acc[badge.rarity].push(badge);
      return acc;
    }, {} as Record<Badge['rarity'], Badge[]>);
    
    return grouped;
  };

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      'common': '#6b7280',
      'rare': '#3b82f6',
      'epic': '#8b5cf6',
      'legendary': '#f59e0b'
    };
    return colors[rarity];
  };

  const getStatsData = () => {
    const totalTasksCompleted = user.roles.reduce((sum, role) => sum + (user.streaks[role.id] || 0), 0);
    const averageStreak = Object.values(user.streaks).reduce((sum, streak) => sum + streak, 0) / Object.keys(user.streaks).length || 0;
    
    return {
      totalTasksCompleted,
      averageStreak: Math.round(averageStreak),
      totalBadges: user.badges.length,
      currentLevel: user.level,
      totalExperience: user.experience,
      rolesUnlocked: user.roles.length
    };
  };

  const stats = getStatsData();

  return (
    <div className="profile-page-container">
      <motion.div
        className="profile-header glass-panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-avatar-section">
          <motion.div
            className="profile-avatar"
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsEditingAvatar(true)}
          >
            <div className="avatar-display">
              {user.avatarConfig.skinTone}
            </div>
            <motion.div
              className="edit-avatar-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <SparklesIcon className="w-4 h-4" />
            </motion.div>
          </motion.div>
          
          <div className="profile-info">
            <div className="username-section">
              {isEditingUsername ? (
                <div className="username-edit">
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="username-input"
                    autoFocus
                  />
                  <div className="username-actions">
                    <button onClick={handleSaveUsername} className="save-button">✓</button>
                    <button onClick={() => setIsEditingUsername(false)} className="cancel-button">✕</button>
                  </div>
                </div>
              ) : (
                <h2 
                  className="username"
                  onClick={() => setIsEditingUsername(true)}
                >
                  {user.username}
                  <span className="edit-icon">✏️</span>
                </h2>
              )}
            </div>
            
            <div className="current-role" style={{ ['--role-color' as any]: user.currentRole.color }}>
              <span className="role-badge">
                {user.currentRole.icon} {user.currentRole.name}
              </span>
            </div>
            
            <div className="level-info">
              <TrophyIcon className="w-5 h-5 text-yellow-500" />
              <span>Level {user.level}</span>
              <span className="points">({user.points.toLocaleString()} pts)</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="profile-tabs glass-panel" role="tablist" tabIndex={0} onKeyDown={handleTabsKeyDown}>
        <div className={`tab-indicator ${selectedTab === 'overview' ? 'pos-0' : selectedTab === 'badges' ? 'pos-1' : 'pos-2'}`} />
        {(['overview', 'badges', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${selectedTab === tab ? 'active' : ''}`}
            role="tab"
            aria-selected={selectedTab === tab}
            onClick={() => setSelectedTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          className="tab-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedTab === 'overview' && (
            <div className="overview-content">
              <div className="roles-section">
                <h3>Unlocked Roles</h3>
                <div className="roles-grid">
                  {user.roles.map((role) => (
                    <motion.div
                      key={role.id}
                      className={`role-card glass-card shine-on-hover ${user.currentRole.id === role.id ? 'current' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      onMouseMove={(e) => {
                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        (e.currentTarget as HTMLDivElement).style.setProperty('--mx', x + '%');
                      }}
                    >
                      <div className="role-icon">{role.icon}</div>
                      <div className="role-name">{role.name}</div>
                      <div className="role-department">{role.department}</div>
                      {user.currentRole.id === role.id && (
                        <div className="current-badge">Current</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="recent-activity glass-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon">🏆</div>
                    <div className="activity-text">Earned "First Aid Hero" badge</div>
                    <div className="activity-time">2 hours ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">⭐</div>
                    <div className="activity-text">Completed "Patient Care" task</div>
                    <div className="activity-time">4 hours ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon">🔥</div>
                    <div className="activity-text">Maintained 7-day streak</div>
                    <div className="activity-time">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'badges' && (
            <div className="badges-content">
              {Object.entries(getBadgesByRarity()).map(([rarity, badges]) => (
                <div key={rarity} className="badge-rarity-section">
                  <h3 className={`rarity-title rarity-${rarity}`}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)} Badges ({badges.length})
                  </h3>
                  <div className="badges-grid">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        className="badge-card"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                      >
                        <div
                          className={`badge-icon rarity-${badge.rarity}`}
                        >
                          {badge.icon}
                        </div>
                        <div className="badge-name">{badge.name}</div>
                        <div className="badge-description">{badge.description}</div>
                        <div className="badge-date">
                          Earned {badge.unlockedAt.toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'stats' && (
            <div className="stats-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{stats.totalTasksCompleted}</div>
                  <div className="stat-label">Tasks Completed</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-value">{stats.averageStreak}</div>
                  <div className="stat-label">Average Streak</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{stats.totalBadges}</div>
                  <div className="stat-label">Badges Earned</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{stats.currentLevel}</div>
                  <div className="stat-label">Current Level</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💎</div>
                  <div className="stat-value">{stats.totalExperience.toLocaleString()}</div>
                  <div className="stat-label">Total Experience</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-value">{stats.rolesUnlocked}</div>
                  <div className="stat-label">Roles Unlocked</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Avatar Customization Modal */}
      <AnimatePresence>
        {isEditingAvatar && (
          <motion.div
            className="avatar-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditingAvatar(false)}
          >
            <motion.div
              className="avatar-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Customize Avatar</h3>
                <button 
                  className="close-button"
                  onClick={() => setIsEditingAvatar(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="avatar-preview">
                <div className="preview-avatar">
                  {tempAvatarConfig.skinTone}
                </div>
              </div>

              <div className="customization-sections">
                <div className="customization-section">
                  <h4>Skin Tone</h4>
                  <div className="options-grid">
                    {skinTones.map((tone) => (
                      <button
                        key={tone}
                        className={`option-button ${tempAvatarConfig.skinTone === tone ? 'selected' : ''}`}
                        onClick={() => setTempAvatarConfig({...tempAvatarConfig, skinTone: tone})}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="customization-section">
                  <h4>Expression</h4>
                  <div className="options-grid">
                    {expressions.map((expression) => (
                      <button
                        key={expression}
                        className={`option-button text ${tempAvatarConfig.expression === expression ? 'selected' : ''}`}
                        onClick={() => setTempAvatarConfig({...tempAvatarConfig, expression})}
                      >
                        {expression}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setIsEditingAvatar(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveAvatar}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
