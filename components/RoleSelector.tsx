/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Role, AvatarConfig } from '../types/game';
import { CheckCircleIcon } from './icons';

interface RoleSelectorProps {
  availableRoles: Role[];
  currentRole: Role;
  avatarConfig: AvatarConfig;
  onRoleSelect: (role: Role) => void;
  userLevel: number;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  availableRoles,
  currentRole,
  avatarConfig,
  onRoleSelect,
  userLevel
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(currentRole);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoleSelect = async (role: Role) => {
    if (role.unlockLevel > userLevel) return;
    
    setIsAnimating(true);
    setSelectedRole(role);
    
    // Simulate role change animation
    setTimeout(() => {
      onRoleSelect(role);
      setIsAnimating(false);
    }, 1000);
  };

  const getAvatarForRole = (role: Role) => {
    const roleAvatars = {
      'Doctor': '👨‍⚕️',
      'Nurse': '👩‍⚕️',
      'Lab Tech': '👨‍🔬',
      'Cleaner': '🧹',
      'Admin': '👔'
    };
    return roleAvatars[role.name as keyof typeof roleAvatars] || '👤';
  };

  return (
    <div className="role-selector-container">
      <motion.div 
        className="role-selector-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
        <p className="text-gray-600">Select a role to start your hospital adventure</p>
      </motion.div>

      <div className="roles-grid">
        {availableRoles.map((role, index) => {
          const isSelected = selectedRole.id === role.id;
          const isLocked = role.unlockLevel > userLevel;
          const isCurrentRole = currentRole.id === role.id;

          return (
            <motion.div
              key={role.id}
              className={`role-card glass-card shine-on-hover ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => !isLocked && handleRoleSelect(role)}
            >
              <div className="role-avatar-container">
                <motion.div
                  className="role-avatar"
                  animate={isAnimating && isSelected ? {
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={{ duration: 1 }}
                >
                  {getAvatarForRole(role)}
                </motion.div>
                
                {isCurrentRole && (
                  <motion.div
                    className="current-role-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                  </motion.div>
                )}
              </div>

              <div className="role-info">
                <h3 className="role-name">{role.name}</h3>
                <p className="role-department">{role.department}</p>
                <p className="role-description">{role.description}</p>
                
                {isLocked && (
                  <div className="lock-info">
                    <span className="lock-icon">🔒</span>
                    <span className="unlock-level">Level {role.unlockLevel}</span>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {isSelected && !isLocked && (
                  <motion.div
                    className="selection-glow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="role-change-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="role-change-animation"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <div className="changing-text">Switching Role...</div>
              <div className="role-transition">
                <span>{getAvatarForRole(currentRole)}</span>
                <span className="arrow">→</span>
                <span>{getAvatarForRole(selectedRole)}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSelector;
