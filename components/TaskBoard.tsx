/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, User } from '../types/game';
import { CheckCircleIcon, ClipboardListIcon, FireIcon } from './icons';

interface TaskBoardProps {
  tasks: Task[];
  currentUser: User;
  onTaskComplete: (taskId: string) => void;
  onTaskStart: (taskId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  currentUser,
  onTaskComplete,
  onTaskStart
}) => {
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    const colors = {
      'easy': '#10b981',
      'medium': '#f59e0b',
      'hard': '#ef4444'
    };
    return colors[difficulty];
  };

  const getTaskAnimation = (role: string) => {
    const animations = {
      'Doctor': '🩺',
      'Nurse': '💉',
      'Lab Tech': '🧪',
      'Cleaner': '🧹',
      'Admin': '📋'
    };
    return animations[role as keyof typeof animations] || '⚡';
  };

  const handleTaskComplete = async (taskId: string) => {
    setCompletingTasks(prev => new Set(prev).add(taskId));
    
    // Simulate task completion animation
    setTimeout(() => {
      onTaskComplete(taskId);
      setCompletingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 2000);
  };

  const getTimeRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="task-board-container">
      <motion.div
        className="task-board-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-title">
          <ClipboardListIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold">Task Board</h2>
        </div>
        
        <div className="task-filters">
          {(['all', 'pending', 'active', 'completed'] as const).map((filterType) => (
            <button
              key={filterType}
              className={`filter-button ${filter === filterType ? 'active' : ''}`}
              onClick={() => setFilter(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <span className="task-count">
                {filterType === 'all' ? tasks.length : tasks.filter(t => t.status === filterType).length}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="tasks-grid">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, index) => {
            const isCompleting = completingTasks.has(task.id);
            const timeRemaining = getTimeRemaining(task.deadline);
            const isExpired = timeRemaining === 'Expired';
            const canComplete = task.status === 'active' && task.role === currentUser.currentRole.name;

            return (
              <motion.div
                key={task.id}
                className={`task-card ${task.status} ${isExpired ? 'expired' : ''}`}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="task-header">
                  <div className="task-role-badge" style={{ backgroundColor: getDifficultyColor(task.difficulty) }}>
                    {task.role}
                  </div>
                  <div className="task-points">+{task.points} pts</div>
                </div>

                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                  
                  <div className="task-meta">
                    <div className="task-department">📍 {task.department}</div>
                    <div className="task-time">⏱️ {task.estimatedTime}min</div>
                    {timeRemaining && (
                      <div className={`task-deadline ${isExpired ? 'expired' : ''}`}>
                        ⏰ {timeRemaining}
                      </div>
                    )}
                  </div>

                  {task.requirements && (
                    <div className="task-requirements">
                      <h4>Requirements:</h4>
                      <ul>
                        {task.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="task-progress">
                  {task.status === 'pending' && (
                    <motion.button
                      className="task-button start-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onTaskStart(task.id)}
                    >
                      Start Task
                    </motion.button>
                  )}

                  {task.status === 'active' && canComplete && (
                    <motion.button
                      className="task-button complete-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <motion.div
                          className="completing-animation"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          {getTaskAnimation(task.role)}
                        </motion.div>
                      ) : (
                        'Complete Task'
                      )}
                    </motion.button>
                  )}

                  {task.status === 'completed' && (
                    <div className="task-completed">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span>Completed!</span>
                    </div>
                  )}
                </div>

                {/* Task Completion Animation Overlay */}
                <AnimatePresence>
                  {isCompleting && (
                    <motion.div
                      className="completion-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="completion-effect"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="completion-text">Task Completing...</div>
                        <motion.div
                          className="completion-progress"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2 }}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTasks.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>
            {filter === 'all' 
              ? 'No tasks available at the moment.' 
              : `No ${filter} tasks found.`
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default TaskBoard;