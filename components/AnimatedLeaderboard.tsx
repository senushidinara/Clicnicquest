/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types/game';
import { TrophyIcon, MedalIcon, FireIcon, UserIcon } from './icons';

interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  change: 'up' | 'down' | 'same' | 'new';
  previousRank?: number;
}

interface AnimatedLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUser: User;
  filterByRole?: string;
  onUserClick: (user: User) => void;
}

const AnimatedLeaderboard: React.FC<AnimatedLeaderboardProps> = ({
  entries,
  currentUser,
  filterByRole,
  onUserClick
}) => {
  const [animatingEntries, setAnimatingEntries] = useState<Set<string>>(new Set());
  const [showRankChanges, setShowRankChanges] = useState(true);

  useEffect(() => {
    // Animate rank changes
    const newEntries = entries.filter(entry => entry.change === 'new');
    if (newEntries.length > 0) {
      const newIds = new Set(newEntries.map(entry => entry.user.id));
      setAnimatingEntries(newIds);
      
      setTimeout(() => {
        setAnimatingEntries(new Set());
      }, 2000);
    }
  }, [entries]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#6b7280';
  };

  const getChangeIcon = (change: LeaderboardEntry['change']) => {
    switch (change) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'new': return '✨';
      default: return '';
    }
  };

  const getChangeColor = (change: LeaderboardEntry['change']) => {
    switch (change) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'new': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getUserAvatar = (user: User) => {
    return user.avatarConfig.skinTone || '👤';
  };

  return (
    <div className="animated-leaderboard-container">
      <motion.div
        className="leaderboard-header glass-panel"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-title">
          <TrophyIcon className="w-8 h-8 text-yellow-500" />
          <h2>Leaderboard</h2>
          {filterByRole && (
            <span className="role-filter">({filterByRole})</span>
          )}
        </div>
        
        <div className="leaderboard-controls">
          <button
            className={`control-button ${showRankChanges ? 'active' : ''}`}
            onClick={() => setShowRankChanges(!showRankChanges)}
          >
            Show Changes
          </button>
        </div>
      </motion.div>

      <div className="leaderboard-list">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.user.id === currentUser.id;
            const isAnimating = animatingEntries.has(entry.user.id);
            const isTopThree = entry.rank <= 3;

            return (
              <motion.div
                key={entry.user.id}
                className={`leaderboard-entry glass-row ${isCurrentUser ? 'current-user' : ''} ${isTopThree ? 'top-three' : ''}`}
                layout
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  x: 0, 
                  scale: isAnimating ? [0.9, 1.1, 1] : 1 
                }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.05,
                  scale: { duration: 0.6, ease: "easeOut" }
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => onUserClick(entry.user)}
              >
                <div className="entry-rank">
                  <motion.div
                    className="rank-display"
                    style={{ color: getRankColor(entry.rank) }}
                    animate={isTopThree ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {getRankIcon(entry.rank)}
                  </motion.div>
                  
                  {showRankChanges && entry.change !== 'same' && (
                    <motion.div
                      className="rank-change"
                      style={{ color: getChangeColor(entry.change) }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getChangeIcon(entry.change)}
                      {entry.previousRank && entry.change !== 'new' && (
                        <span className="rank-diff">
                          {Math.abs(entry.rank - entry.previousRank)}
                        </span>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="entry-user">
                  <motion.div
                    className="user-avatar"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {getUserAvatar(entry.user)}
                  </motion.div>
                  
                  <div className="user-info">
                    <div className="user-name">
                      {entry.user.username}
                      {isCurrentUser && <span className="you-badge">You</span>}
                    </div>
                    <div className="user-role">
                      <span 
                        className="role-badge"
                        style={{ backgroundColor: entry.user.currentRole.color }}
                      >
                        {entry.user.currentRole.icon} {entry.user.currentRole.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="entry-stats">
                  <div className="stat-item">
                    <span className="stat-value">{entry.score.toLocaleString()}</span>
                    <span className="stat-label">Points</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-value">L{entry.user.level}</span>
                    <span className="stat-label">Level</span>
                  </div>
                  
                  {Object.values(entry.user.streaks).some(streak => streak > 0) && (
                    <div className="stat-item">
                      <FireIcon className="w-4 h-4 text-orange-500" />
                      <span className="stat-value">
                        {Math.max(...Object.values(entry.user.streaks))}
                      </span>
                      <span className="stat-label">Streak</span>
                    </div>
                  )}
                </div>

                {/* Celebration Animation for Top 3 */}
                {isTopThree && (
                  <motion.div
                    className="celebration-particles"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="particle"
                        animate={{
                          y: [-10, -30, -10],
                          x: [0, Math.random() * 20 - 10, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2 + index * 0.5
                        }}
                      >
                        ✨
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* New Entry Glow */}
                {entry.change === 'new' && (
                  <motion.div
                    className="new-entry-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: 3 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {entries.length === 0 && (
        <motion.div
          className="empty-leaderboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TrophyIcon className="w-16 h-16 text-gray-400" />
          <h3>No entries yet</h3>
          <p>Be the first to complete tasks and climb the leaderboard!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedLeaderboard;
