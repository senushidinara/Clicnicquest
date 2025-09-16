/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestProgress as QuestProgressType, Badge, User } from '../types/game';
import { TrophyIcon, FireIcon, MedalIcon, SparklesIcon } from './icons';

interface QuestProgressProps {
  progress: QuestProgressType;
  user: User;
  recentBadges: Badge[];
  onBadgeClick: (badge: Badge) => void;
}

const QuestProgress: React.FC<QuestProgressProps> = ({
  progress,
  user,
  recentBadges,
  onBadgeClick
}) => {
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [pointsGained, setPointsGained] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showNewBadge, setShowNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    // Simulate points gained animation
    if (pointsGained > 0) {
      setShowPointsPopup(true);
      setTimeout(() => setShowPointsPopup(false), 2000);
    }
  }, [pointsGained]);

  useEffect(() => {
    // Show new badge animation
    if (recentBadges.length > 0) {
      const latestBadge = recentBadges[recentBadges.length - 1];
      setShowNewBadge(latestBadge);
      setTimeout(() => setShowNewBadge(null), 3000);
    }
  }, [recentBadges]);

  const getRarityColor = (rarity: Badge['rarity']) => {
    const colors = {
      'common': '#6b7280',
      'rare': '#3b82f6',
      'epic': '#8b5cf6',
      'legendary': '#f59e0b'
    };
    return colors[rarity];
  };

  const getRoleEmoji = (roleName: string) => {
    const emojis = {
      'Doctor': '👨‍⚕️',
      'Nurse': '👩‍⚕️',
      'Lab Tech': '👨‍🔬',
      'Cleaner': '🧹',
      'Admin': '👔'
    };
    return emojis[roleName as keyof typeof emojis] || '👤';
  };

  const completionPercentage = (progress.completedTasks / progress.totalTasks) * 100;
  const levelProgress = (progress.nextLevelProgress * 100);

  return (
    <div className="quest-progress-container">
      {/* Main Progress Card */}
      <motion.div
        className="progress-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="progress-header">
          <div className="user-info">
            <motion.div
              className="user-avatar"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {getRoleEmoji(user.currentRole.name)}
            </motion.div>
            <div className="user-details">
              <h3 className="user-name">{user.username}</h3>
              <p className="user-role">{user.currentRole.name}</p>
            </div>
          </div>
          
          <div className="level-info">
            <motion.div
              className="level-badge"
              whileHover={{ scale: 1.05 }}
            >
              <span className="level-number">{progress.level}</span>
              <span className="level-label">Level</span>
            </motion.div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="progress-stats">
          <div className="stat-item">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-value">{progress.completedTasks}/{progress.totalTasks}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{progress.pointsEarned.toLocaleString()}</div>
              <div className="stat-label">Points Earned</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{progress.currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="progress-bars">
          <div className="progress-bar-section">
            <div className="progress-bar-header">
              <span>Daily Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="progress-bar-section">
            <div className="progress-bar-header">
              <span>Level Progress</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div
                className="progress-bar-fill level-progress"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="badges-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="badges-header">
          <MedalIcon className="w-6 h-6 text-yellow-500" />
          <h3>Recent Badges</h3>
        </div>
        
        <div className="badges-grid">
          {progress.badgesEarned.slice(-6).map((badge, index) => (
            <motion.div
              key={badge.id}
              className="badge-item"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => onBadgeClick(badge)}
            >
              <div 
                className="badge-icon"
                style={{ color: getRarityColor(badge.rarity) }}
              >
                {badge.icon}
              </div>
              <div className="badge-name">{badge.name}</div>
              <div 
                className="badge-rarity"
                style={{ color: getRarityColor(badge.rarity) }}
              >
                {badge.rarity}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Animations and Popups */}
      <AnimatePresence>
        {showPointsPopup && (
          <motion.div
            className="points-popup"
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <SparklesIcon className="w-8 h-8 text-yellow-500" />
            <span className="points-text">+{pointsGained} Points!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            className="level-up-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="level-up-content"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <TrophyIcon className="w-16 h-16 text-yellow-500" />
              <h2>Level Up!</h2>
              <p>You've reached Level {progress.level}!</p>
              <motion.button
                className="level-up-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLevelUp(false)}
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewBadge && (
          <motion.div
            className="new-badge-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="new-badge-content"
              initial={{ scale: 0, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <motion.div
                className="badge-celebration"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <div 
                  className="new-badge-icon"
                  style={{ color: getRarityColor(showNewBadge.rarity) }}
                >
                  {showNewBadge.icon}
                </div>
              </motion.div>
              <h3>New Badge Earned!</h3>
              <h4>{showNewBadge.name}</h4>
              <p>{showNewBadge.description}</p>
              <div 
                className="new-badge-rarity"
                style={{ color: getRarityColor(showNewBadge.rarity) }}
              >
                {showNewBadge.rarity.toUpperCase()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestProgress;