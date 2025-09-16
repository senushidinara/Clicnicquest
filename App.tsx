/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import RoleSelector from './components/RoleSelector';
import HospitalMap from './components/HospitalMap';
import TaskBoard from './components/TaskBoard';
import QuestProgress from './components/QuestProgress';
import AnimatedLeaderboard from './components/AnimatedLeaderboard';
import ProfilePage from './components/ProfilePage';
import { 
    CheckCircleIcon, TrophyIcon, XCircleIcon, BrainIcon, MedalIcon, UserIcon,
    StethoscopeIcon, ClipboardListIcon, ChipIcon, BeakerIcon, BroomIcon,
    SparklesIcon, FireIcon, PuzzlePieceIcon, DocumentChartBarIcon, AcademicCapIcon,
    ArrowsRightLeftIcon, ExclamationTriangleIcon, ShieldCheckIcon, WrenchScrewdriverIcon
} from './components/icons';
import { generateDailyMission, Mission, MissionType, generateAvatarImage } from './services/geminiService';
import { User, Role, Task, Department, Badge, AvatarConfig, QuestProgress as QuestProgressType } from './types/game';
import Spinner from './components/Spinner';

type View = 'dashboard' | 'quiz' | 'leaderboard' | 'profile' | 'hospital-map' | 'role-selector';

const missionTypeDetails: Record<MissionType, { icon: React.FC<{ className?: string }>, color: string }> = {
    TRIVIA: { icon: BrainIcon, color: 'blue' },
    RIDDLE: { icon: PuzzlePieceIcon, color: 'purple' },
    DIAGNOSIS_CHALLENGE: { icon: DocumentChartBarIcon, color: 'teal' },
    MEDICAL_HISTORY: { icon: AcademicCapIcon, color: 'amber' },
    LAB_SAFETY_SCENARIO: { icon: ShieldCheckIcon, color: 'yellow' },
    LOGISTICS_PUZZLE: { icon: ArrowsRightLeftIcon, color: 'emerald' },
    TECH_TROUBLESHOOTING: { icon: WrenchScrewdriverIcon, color: 'indigo' },
    FACILITIES_CHALLENGE: { icon: ExclamationTriangleIcon, color: 'red' },
};


// Game Data
const availableRoles: Role[] = [
    {
        id: 'doctor',
        name: 'Doctor',
        department: 'Emergency',
        color: '#ef4444',
        icon: '👨‍⚕️',
        description: 'Diagnose and treat patients with medical expertise',
        unlockLevel: 1
    },
    {
        id: 'nurse',
        name: 'Nurse',
        department: 'ICU',
        color: '#10b981',
        icon: '👩‍⚕️',
        description: 'Provide compassionate patient care and support',
        unlockLevel: 1
    },
    {
        id: 'lab-tech',
        name: 'Lab Tech',
        department: 'Laboratory',
        color: '#8b5cf6',
        icon: '👨‍🔬',
        description: 'Analyze samples and conduct medical tests',
        unlockLevel: 3
    },
    {
        id: 'cleaner',
        name: 'Cleaner',
        department: 'Maintenance',
        color: '#f59e0b',
        icon: '🧹',
        description: 'Maintain hospital cleanliness and safety standards',
        unlockLevel: 1
    },
    {
        id: 'admin',
        name: 'Admin',
        department: 'Administration',
        color: '#6b7280',
        icon: '👔',
        description: 'Manage hospital operations and staff coordination',
        unlockLevel: 5
    }
];

const hospitalDepartments: Department[] = [
    {
        id: 'emergency',
        name: 'Emergency',
        location: { x: 20, y: 30 },
        color: '#ef4444',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    },
    {
        id: 'icu',
        name: 'ICU',
        location: { x: 80, y: 30 },
        color: '#10b981',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    },
    {
        id: 'laboratory',
        name: 'Laboratory',
        location: { x: 20, y: 70 },
        color: '#8b5cf6',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    },
    {
        id: 'maintenance',
        name: 'Maintenance',
        location: { x: 50, y: 70 },
        color: '#f59e0b',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    },
    {
        id: 'administration',
        name: 'Administration',
        location: { x: 80, y: 70 },
        color: '#6b7280',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    },
    {
        id: 'surgery',
        name: 'Surgery',
        location: { x: 50, y: 30 },
        color: '#06b6d4',
        taskQueue: [],
        staffAssigned: [],
        status: 'normal'
    }
];

// Sample tasks
const sampleTasks: Task[] = [
    {
        id: 'task-1',
        title: 'Emergency Patient Assessment',
        description: 'Assess and triage incoming emergency patients',
        role: 'Doctor',
        department: 'emergency',
        points: 50,
        status: 'pending',
        difficulty: 'medium',
        estimatedTime: 30,
        requirements: ['Medical degree', 'Emergency certification']
    },
    {
        id: 'task-2',
        title: 'Patient Medication Administration',
        description: 'Administer prescribed medications to ICU patients',
        role: 'Nurse',
        department: 'icu',
        points: 30,
        status: 'pending',
        difficulty: 'easy',
        estimatedTime: 15
    },
    {
        id: 'task-3',
        title: 'Blood Sample Analysis',
        description: 'Process and analyze blood samples for diagnostic results',
        role: 'Lab Tech',
        department: 'laboratory',
        points: 40,
        status: 'pending',
        difficulty: 'medium',
        estimatedTime: 45
    },
    {
        id: 'task-4',
        title: 'Ward Sanitization',
        description: 'Deep clean and sanitize patient wards',
        role: 'Cleaner',
        department: 'maintenance',
        points: 25,
        status: 'pending',
        difficulty: 'easy',
        estimatedTime: 60
    }
];


const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    
    // User state
    const [currentUser, setCurrentUser] = useState<User>({
        id: 'user-1',
        username: 'Player',
        roles: [availableRoles[0], availableRoles[1]],
        points: 150,
        badges: [],
        avatarConfig: {
            skinTone: '👤',
            hair: '',
            outfit: '',
            accessories: [],
            expression: 'happy'
        },
        streaks: { 'doctor': 3, 'nurse': 1 },
        currentRole: availableRoles[0],
        level: 2,
        experience: 150
    });
    
    // Game state
    const [departments, setDepartments] = useState<Department[]>(hospitalDepartments);
    const [tasks, setTasks] = useState<Task[]>(sampleTasks);
    const [leaderboardEntries, setLeaderboardEntries] = useState([
        {
            rank: 1,
            user: currentUser,
            score: currentUser.points,
            change: 'same' as const,
            previousRank: 1
        }
    ]);
    
    // Legacy mission state (keeping for compatibility)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [mission, setMission] = useState<Mission | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Game handlers
    const handleRoleSelect = (role: Role) => {
        setCurrentUser(prev => ({ ...prev, currentRole: role }));
        setView('dashboard');
    };
    
    const handleDepartmentClick = (department: Department) => {
        console.log('Department clicked:', department.name);
    };
    
    const handleTaskSelect = (task: Task) => {
        console.log('Task selected:', task.title);
    };
    
    const handleTaskStart = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, status: 'active' as const } : task
        ));
    };
    
    const handleTaskComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setTasks(prev => prev.map(t => 
                t.id === taskId ? { ...t, status: 'completed' as const } : t
            ));
            
            // Award points
            setCurrentUser(prev => ({
                ...prev,
                points: prev.points + task.points,
                experience: prev.experience + task.points
            }));
        }
    };
    
    const handleAvatarUpdate = (config: AvatarConfig) => {
        setCurrentUser(prev => ({ ...prev, avatarConfig: config }));
    };
    
    const handleUsernameUpdate = (username: string) => {
        setCurrentUser(prev => ({ ...prev, username }));
    };
    
    const handleUserClick = (user: User) => {
        console.log('User clicked:', user.username);
    };
    
    const handleBadgeClick = (badge: Badge) => {
        console.log('Badge clicked:', badge.name);
    };

    const handleNavigate = (view: 'dashboard' | 'leaderboard' | 'profile' | 'hospital-map' | 'role-selector') => {
        setView(view);
    };

    // Quest progress calculation
    const questProgress: QuestProgressType = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const totalTasks = tasks.length;
        const currentStreak = Math.max(...Object.values(currentUser.streaks));
        
        return {
            totalTasks,
            completedTasks,
            currentStreak,
            pointsEarned: currentUser.points,
            badgesEarned: currentUser.badges,
            level: currentUser.level,
            nextLevelProgress: (currentUser.experience % 100) / 100
        };
    }, [tasks, currentUser]);

    // Legacy mission handlers (keeping for compatibility)
    const handleStartMission = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const missionData = await generateDailyMission();
            setMission(missionData);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setAnswerStatus(null);
            setView('quiz');
        } catch (err) {
            setError('Failed to generate the mission. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAnswer = (option: string) => {
        if (answerStatus) return;
        setSelectedAnswer(option);
    };

    const handleSubmitAnswer = () => {
        if (!selectedAnswer || !mission) return;

        const isCorrect = selectedAnswer === mission.questions[currentQuestionIndex].answer;
        const isFinalQuestion = currentQuestionIndex === mission.questions.length - 1;

        if (isCorrect) {
            setAnswerStatus('correct');
            
            const pointsEarned = mission.questions[currentQuestionIndex].points;
            setCurrentUser(prev => ({
                ...prev,
                points: prev.points + pointsEarned,
                experience: prev.experience + pointsEarned
            }));
        } else {
            setAnswerStatus('incorrect');
        }

        setTimeout(() => {
            if (!isFinalQuestion) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setAnswerStatus(null);
            } else {
                setView('dashboard');
                setMission(null);
            }
        }, 1500);
    };

    // Render functions
    const renderDashboard = () => (
        <motion.div
            className="dashboard-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-grid">
                <div className="dashboard-card main-card">
                    <div className="card-header">
                        <BrainIcon className="w-8 h-8 text-blue-500" />
                        <h2 className="text-2xl font-bold">Welcome to ClinicQuest</h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Step into the world of hospital simulation. Choose your role, complete tasks, and climb the leaderboard!
                    </p>
                    
                    <div className="action-buttons">
                        <motion.button
                            className="btn btn-primary shine-on-hover"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('hospital-map')}
                        >
                            🏥 Explore Hospital
                        </motion.button>
                        
                        <motion.button
                            className="btn btn-secondary shine-on-hover"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('role-selector')}
                        >
                            👤 Change Role
                        </motion.button>
                    </div>
                    
                    <div className="legacy-mission-section">
                        <h3 className="text-lg font-semibold mb-4">Daily AI Mission</h3>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button 
                            onClick={handleStartMission} 
                            className="btn btn-primary w-full" 
                            disabled={isLoading}
                        >
                            {isLoading ? <Spinner /> : 'Start AI Mission'}
                        </button>
                    </div>
                </div>
                
                <QuestProgress
                    progress={questProgress}
                    user={currentUser}
                    recentBadges={currentUser.badges}
                    onBadgeClick={handleBadgeClick}
                />
            </div>
        </motion.div>
    );
    
    const renderLegacyMissionView = () => {
        if (isLoading) {
            return (
                <div className="card text-center flex flex-col items-center justify-center gap-4 p-8">
                    <Spinner size="lg" />
                    <h2 className="text-2xl font-semibold text-gray-700">Generating Your Mission...</h2>
                    <p className="text-gray-500">Our AI is preparing your challenge.</p>
                </div>
            )
        }
        if (!mission || mission.questions.length === 0) {
            return (
                 <div className="card text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Mission Failed to Load</h2>
                    <p className="text-lg text-gray-500 mb-6">There was an error generating the mission. Please go back and try again.</p>
                     <button onClick={() => setView('dashboard')} className="btn btn-secondary">
                        Back to Dashboard
                    </button>
                </div>
            );
        }

        const question = mission.questions[currentQuestionIndex];
        const details = missionTypeDetails[mission.type] || missionTypeDetails.TRIVIA;
        const MissionIcon = details.icon;

        return (
            <div className="card w-full max-w-2xl animate-fade-in p-0 overflow-hidden">
                <div className={`mission-header mission-header-${details.color}`}>
                    <MissionIcon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{mission.title}</h2>
                </div>
                <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                        <p className="text-md text-gray-600 mb-4">{mission.description}</p>
                        <p className="text-sm font-semibold text-blue-500">Question {currentQuestionIndex + 1} of {mission.questions.length}</p>
                        <h3 className="text-2xl font-bold mt-2">{question.question}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectAnswer = option === question.answer;
                            let dynamicClasses = '';

                            if (answerStatus) { // Feedback state after submission
                                if (isCorrectAnswer) {
                                    // Highlight correct answer in green, always.
                                    dynamicClasses = 'border-green-500 bg-green-100 text-green-800 animate-correct';
                                } else if (isSelected && !isCorrectAnswer) {
                                    // If this incorrect option was selected, highlight red.
                                    dynamicClasses = 'border-red-500 bg-red-100 text-red-800 animate-incorrect';
                                } else {
                                    // Fade out other incorrect, unselected options.
                                    dynamicClasses = 'border-gray-300 opacity-50';
                                }
                            } else { // Selection state before submission
                                if (isSelected) {
                                    dynamicClasses = 'border-blue-500 bg-blue-100 ring-2 ring-blue-300';
                                } else {
                                    dynamicClasses = 'border-gray-300 hover:bg-gray-100 hover:border-blue-400';
                                }
                            }
                            
                            return (
                                <button
                                    key={option}
                                    onClick={() => handleSelectAnswer(option)}
                                    className={`p-4 border-2 rounded-lg text-left font-semibold transition-all duration-200 flex items-center gap-3 ${dynamicClasses}`}
                                    disabled={!!answerStatus}
                                >
                                    <span className="flex-shrink-0 font-bold text-blue-500">{String.fromCharCode(65 + index)}</span>
                                    <span>{option}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-8 flex flex-col items-center h-12 justify-center">
                        {!answerStatus && (
                            <button onClick={handleSubmitAnswer} disabled={!selectedAnswer} className="btn btn-primary w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed">
                                Submit Answer
                            </button>
                        )}
                        {answerStatus === 'correct' && (
                            <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                                <CheckCircleIcon className="w-8 h-8"/>
                                <p className="text-xl font-bold">Correct! +{mission.questions[currentQuestionIndex].points} points</p>
                            </div>
                        )}
                        {answerStatus === 'incorrect' && (
                            <div className="flex items-center gap-2 text-red-600 animate-fade-in">
                                <XCircleIcon className="w-8 h-8"/>
                                <p className="text-xl font-bold">Incorrect!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const CurrentView = () => {
        switch (view) {
            case 'quiz': return renderLegacyMissionView();
            case 'leaderboard': 
                return (
                    <AnimatedLeaderboard
                        entries={leaderboardEntries}
                        currentUser={currentUser}
                        onUserClick={handleUserClick}
                    />
                );
            case 'profile': 
                return (
                    <ProfilePage
                        user={currentUser}
                        onAvatarUpdate={handleAvatarUpdate}
                        onUsernameUpdate={handleUsernameUpdate}
                    />
                );
            case 'hospital-map':
                return (
                    <HospitalMap
                        departments={departments}
                        currentUser={currentUser}
                        activeTasks={tasks.filter(t => t.status === 'active')}
                        onDepartmentClick={handleDepartmentClick}
                        onTaskSelect={handleTaskSelect}
                    />
                );
            case 'role-selector':
                return (
                    <RoleSelector
                        availableRoles={availableRoles}
                        currentRole={currentUser.currentRole}
                        avatarConfig={currentUser.avatarConfig}
                        onRoleSelect={handleRoleSelect}
                        userLevel={currentUser.level}
                    />
                );
            case 'dashboard':
            default: return renderDashboard();
        }
    }

    return (
        <div className="min-h-screen font-sans flex flex-col items-center app-bg">
            <Header
                currentView={view}
                onNavigate={handleNavigate}
                score={currentUser.points}
                levelName={currentUser.currentRole.name}
                userAvatar={currentUser.avatarConfig.skinTone}
            />
            <main className="w-full flex-grow flex flex-col items-center p-4 md:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex justify-center"
                    >
                        <CurrentView />
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {/* Floating Task Board Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 500 }}
            >
                <motion.button
                    className="task-board-fab"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setView(view === 'dashboard' ? 'hospital-map' : 'dashboard')}
                >
                    {view === 'dashboard' ? '📋' : '🏠'}
                </motion.button>
            </motion.div>
        </div>
    );
};

export default App;
