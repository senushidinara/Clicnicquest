/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Department, Task, User } from '../types/game';
import { StethoscopeIcon, BeakerIcon, BroomIcon, ClipboardListIcon, UserIcon } from './icons';

interface HospitalMapProps {
  departments: Department[];
  currentUser: User;
  activeTasks: Task[];
  onDepartmentClick: (department: Department) => void;
  onTaskSelect: (task: Task) => void;
}

const HospitalMap: React.FC<HospitalMapProps> = ({
  departments,
  currentUser,
  activeTasks,
  onDepartmentClick,
  onTaskSelect
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<Department | null>(null);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });

  const getDepartmentIcon = (departmentName: string) => {
    const icons = {
      'Emergency': StethoscopeIcon,
      'Laboratory': BeakerIcon,
      'Maintenance': BroomIcon,
      'Administration': ClipboardListIcon,
      'ICU': StethoscopeIcon,
      'Surgery': StethoscopeIcon
    };
    return icons[departmentName as keyof typeof icons] || UserIcon;
  };

  const getStatusColor = (status: Department['status']) => {
    const colors = {
      'normal': '#10b981',
      'busy': '#f59e0b',
      'critical': '#ef4444',
      'completed': '#8b5cf6'
    };
    return colors[status];
  };

  const moveToLocation = (department: Department) => {
    setUserPosition({ x: department.location.x, y: department.location.y });
  };

  const handleDepartmentClick = (department: Department) => {
    setSelectedDepartment(department);
    moveToLocation(department);
    onDepartmentClick(department);
  };

  return (
    <div className="hospital-map-container">
      <motion.div
        className="hospital-map"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hospital Layout Background */}
        <div className="hospital-layout">
          <div className="hospital-corridors">
            <div className="corridor horizontal" style={{ top: '30%' }} />
            <div className="corridor horizontal" style={{ top: '70%' }} />
            <div className="corridor vertical" style={{ left: '30%' }} />
            <div className="corridor vertical" style={{ left: '70%' }} />
          </div>

          {/* Departments */}
          {departments.map((department) => {
            const Icon = getDepartmentIcon(department.name);
            const hasActiveTasks = activeTasks.some(task => task.department === department.id);
            const isUserRole = currentUser.currentRole.department === department.name;

            return (
              <motion.div
                key={department.id}
                className={`department ${selectedDepartment?.id === department.id ? 'selected' : ''}`}
                style={{
                  left: `${department.location.x}%`,
                  top: `${department.location.y}%`,
                  borderColor: getStatusColor(department.status)
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                onHoverStart={() => setHoveredDepartment(department)}
                onHoverEnd={() => setHoveredDepartment(null)}
                onClick={() => handleDepartmentClick(department)}
              >
                <div className="department-icon">
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="department-name">{department.name}</div>
                
                {/* Status Indicator */}
                <motion.div
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(department.status) }}
                  animate={department.status === 'critical' ? {
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1]
                  } : {}}
                  transition={{ duration: 1, repeat: department.status === 'critical' ? Infinity : 0 }}
                />

                {/* Active Tasks Indicator */}
                {hasActiveTasks && (
                  <motion.div
                    className="task-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <span className="task-count">{department.taskQueue.length}</span>
                  </motion.div>
                )}

                {/* User Role Highlight */}
                {isUserRole && (
                  <motion.div
                    className="user-role-highlight"
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(59, 130, 246, 0.7)',
                        '0 0 0 10px rgba(59, 130, 246, 0)',
                        '0 0 0 0 rgba(59, 130, 246, 0)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* User Avatar */}
          <motion.div
            className="user-avatar"
            animate={{
              left: `${userPosition.x}%`,
              top: `${userPosition.y}%`
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.div
              className="avatar-sprite"
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👤
            </motion.div>
          </motion.div>

          {/* Department Tooltip */}
          <AnimatePresence>
            {hoveredDepartment && (
              <motion.div
                className="department-tooltip"
                style={{
                  left: `${hoveredDepartment.location.x}%`,
                  top: `${hoveredDepartment.location.y - 15}%`
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tooltip-content">
                  <h4>{hoveredDepartment.name}</h4>
                  <p>Status: <span style={{ color: getStatusColor(hoveredDepartment.status) }}>
                    {hoveredDepartment.status.toUpperCase()}
                  </span></p>
                  <p>Tasks: {hoveredDepartment.taskQueue.length}</p>
                  <p>Staff: {hoveredDepartment.staffAssigned.length}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Department Details Panel */}
      <AnimatePresence>
        {selectedDepartment && (
          <motion.div
            className="department-details-panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="panel-header">
              <h3>{selectedDepartment.name}</h3>
              <button
                className="close-button"
                onClick={() => setSelectedDepartment(null)}
              >
                ×
              </button>
            </div>
            
            <div className="panel-content">
              <div className="status-section">
                <span className="status-label">Status:</span>
                <span 
                  className="status-value"
                  style={{ color: getStatusColor(selectedDepartment.status) }}
                >
                  {selectedDepartment.status.toUpperCase()}
                </span>
              </div>

              <div className="tasks-section">
                <h4>Active Tasks ({selectedDepartment.taskQueue.length})</h4>
                <div className="task-list">
                  {selectedDepartment.taskQueue.map((task) => (
                    <motion.div
                      key={task.id}
                      className="task-item"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onTaskSelect(task)}
                    >
                      <div className="task-title">{task.title}</div>
                      <div className="task-points">+{task.points} pts</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalMap;