/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import { 
    CheckCircleIcon, TrophyIcon, XCircleIcon, BrainIcon, MedalIcon, UserIcon, 
    StethoscopeIcon, ClipboardListIcon, ChipIcon, BeakerIcon, BroomIcon, 
    SparklesIcon, FireIcon, PuzzlePieceIcon, DocumentChartBarIcon, AcademicCapIcon, 
    ArrowsRightLeftIcon, ExclamationTriangleIcon, ShieldCheckIcon, WrenchScrewdriverIcon 
} from './components/icons';
// FIX: Import generateAvatarImage to make it available for use in the component.
import { generateDailyMission, Mission, MissionType, generateAvatarImage } from './services/geminiService';
import Spinner from './components/Spinner';


type View = 'dashboard' | 'quiz' | 'leaderboard' | 'profile';

interface Level {
    name: string;
    minScore: number;
    avatar: string;
}

interface CareerTrack {
    name: string;
    icon: React.FC<{ className?: string }>;
    levels: Level[];
}

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


const careerTracks: CareerTrack[] = [
    {
        name: 'Clinical Staff',
        icon: StethoscopeIcon,
        levels: [
            { name: 'First Aider', minScore: 0, avatar: '🩹' },
            { name: 'EMT', minScore: 25, avatar: '🚑' },
            { name: 'Paramedic', minScore: 75, avatar: '👨‍⚕️' },
            { name: 'Medical Student', minScore: 150, avatar: '🧑‍⚕️' },
            { name: 'Intern', minScore: 300, avatar: '🩺' },
            { name: 'Resident', minScore: 500, avatar: '🏨' },
            { name: 'Attending Physician', minScore: 750, avatar: '🌟' },
            { name: 'Chief of Medicine', minScore: 1000, avatar: '🏆' },
        ]
    },
    {
        name: 'Hospital Operations',
        icon: ClipboardListIcon,
        levels: [
            { name: 'Hospital Volunteer', minScore: 0, avatar: '🙋' },
            { name: 'Receptionist', minScore: 40, avatar: '☎️' },
            { name: 'Unit Clerk', minScore: 100, avatar: '📋' },
            { name: 'Patient Coordinator', minScore: 250, avatar: '🤝' },
            { name: 'Department Manager', minScore: 450, avatar: '📈' },
            { name: 'Hospital Administrator', minScore: 650, avatar: '👔' },
            { name: 'Chief Operating Officer', minScore: 900, avatar: '👑' },
        ]
    },
    {
        name: 'Technical Services',
        icon: ChipIcon,
        levels: [
            { name: 'IT Help Desk', minScore: 0, avatar: '🎧' },
            { name: 'Junior Developer', minScore: 100, avatar: '💻' },
            { name: 'Data Analyst', minScore: 280, avatar: '📊' },
            { name: 'Systems Analyst', minScore: 480, avatar: '⚙️' },
            { name: 'Senior Software Engineer', minScore: 680, avatar: '🚀' },
            { name: 'Lead Architect', minScore: 900, avatar: '🏗️' },
            { name: 'Director of Health Informatics', minScore: 1100, avatar: '🌐' },
        ]
    },
    {
        name: 'Research & Academia',
        icon: BeakerIcon,
        levels: [
            { name: 'Lab Assistant', minScore: 0, avatar: '🧪' },
            { name: 'Graduate Researcher', minScore: 125, avatar: '🔬' },
            { name: 'Post-Doc Fellow', minScore: 325, avatar: '🧬' },
            { name: 'Associate Professor', minScore: 650, avatar: '🧑‍🏫' },
            { name: 'Principal Investigator', minScore: 950, avatar: '💡' },
            { name: 'Dean of Medical School', minScore: 1200, avatar: '🏛️' },
        ]
    },
    {
        name: 'Support Services',
        icon: BroomIcon,
        levels: [
            { name: 'Janitorial Staff', minScore: 0, avatar: '🧹' },
            { name: 'Food Services', minScore: 30, avatar: '🍽️' },
            { name: 'Maintenance Tech', minScore: 80, avatar: '🔧' },
            { name: 'Security Guard', minScore: 180, avatar: '👮' },
            { name: 'Facilities Supervisor', minScore: 400, avatar: '🏢' },
            { name: 'Director of Support Services', minScore: 650, avatar: '🎖️' },
        ]
    }
];


const initialLeaderboard = [
    { rank: 1, name: 'Dr. Anya Sharma', score: 1250 },
    { rank: 2, name: 'Alex "Suture" Chen', score: 1180 },
    { rank: 4, name: 'Nurse Ben Carter', score: 990 },
    { rank: 5, name: 'Chloe "Stat" Rodriguez', score: 950 },
].sort((a, b) => b.score - a.score);

const predefinedAvatars = ['🧑‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '🧠', '❤️', '💊', '💉', '🧬', '🦠', '🐶', '🐱'];


const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastCompletionDate, setLastCompletionDate] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
    const [leaderboardData, setLeaderboardData] = useState(initialLeaderboard);
    const [mission, setMission] = useState<Mission | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Profile Customization State
    const [userAvatar, setUserAvatar] = useState(predefinedAvatars[0]);
    const [primaryTrack, setPrimaryTrack] = useState(careerTracks[0].name);
    const [isAvatarGenerating, setIsAvatarGenerating] = useState(false);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    const missionCompleted = lastCompletionDate === todayStr;

    // Load user data from localStorage on initial render
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('clinicQuestUser');
            if (savedData) {
                const { score, lastCompletionDate, avatar, track, streak: savedStreak } = JSON.parse(savedData);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                setScore(score || 0);
                setUserAvatar(avatar || predefinedAvatars[0]);
                setPrimaryTrack(track || careerTracks[0].name);
                setLastCompletionDate(lastCompletionDate || null);

                // Initialize streak
                if (lastCompletionDate === todayStr || lastCompletionDate === yesterdayStr) {
                    setStreak(savedStreak || 0);
                } else {
                    setStreak(0); // Streak is broken
                }
            }
        } catch (e) {
            console.error("Failed to parse user data from localStorage", e);
        }
    }, []);

    // Save user data to localStorage and update leaderboard whenever key stats change
    useEffect(() => {
        const dataToSave = {
            score,
            lastCompletionDate,
            avatar: userAvatar,
            track: primaryTrack,
            streak,
        };
        localStorage.setItem('clinicQuestUser', JSON.stringify(dataToSave));
        
        const playerInLeaderboard = leaderboardData.some(p => p.name === 'You');
        const updatedLeaderboard = playerInLeaderboard
          ? leaderboardData.map(p => p.name === 'You' ? { ...p, score } : p)
          : [...leaderboardData, { rank: 0, name: 'You', score }];

        setLeaderboardData(
            updatedLeaderboard
                .sort((a, b) => b.score - a.score)
                .map((p, i) => ({ ...p, rank: i + 1 }))
        );

    }, [score, lastCompletionDate, userAvatar, primaryTrack, streak]);

    const primaryRankInfo = useMemo(() => {
        const track = careerTracks.find(t => t.name === primaryTrack) || careerTracks[0];
        return track.levels.slice().reverse().find(l => score >= l.minScore) || track.levels[0];
    }, [score, primaryTrack]);

    const handleNavigate = (view: 'dashboard' | 'leaderboard' | 'profile') => {
        setView(view);
    };

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
            
            let pointsEarned = mission.questions[currentQuestionIndex].points;

            // On the final question, calculate streak and bonus
            if (isFinalQuestion) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                let newStreak = 1;
                if (lastCompletionDate === yesterdayStr) {
                    newStreak = streak + 1;
                }
                
                // Add bonus for maintaining a streak (day 2 onwards)
                if (newStreak > 1) {
                    const streakBonus = (newStreak - 1) * 5; // e.g., Day 2 gets 5 pts, Day 3 gets 10 pts
                    pointsEarned += streakBonus;
                }
                setStreak(newStreak);
            }
            setScore(prevScore => prevScore + pointsEarned);
        } else {
            setAnswerStatus('incorrect');
        }

        setTimeout(() => {
            if (!isFinalQuestion) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setAnswerStatus(null);
            } else {
                setLastCompletionDate(todayStr);
                setView('dashboard');
                setMission(null);
            }
        }, 1500);
    };

    const handleGenerateAvatar = async () => {
        setIsAvatarGenerating(true);
        setError(null);
        try {
            const prompt = `A vibrant, friendly cartoon avatar for a medical game profile picture. The style should be modern, clean, and appealing. Subject should be a ${primaryRankInfo.name}.`;
            const imageData = await generateAvatarImage(prompt);
            setUserAvatar(`data:image/png;base64,${imageData}`);
        } catch (err) {
            setError("Avatar generation failed. Please try again later.");
            console.error("Failed to generate avatar", err);
        } finally {
            setIsAvatarGenerating(false);
        }
    };

    const renderDashboard = () => (
        <div className="card text-center animate-fade-in w-full max-w-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
                <BrainIcon className="w-10 h-10 text-blue-500" />
                <h2 className="text-3xl font-bold">ClinicQuest</h2>
            </div>
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800">Your Daily Challenge Awaits</h3>

                {streak > 0 && (
                     <div className="streak-counter">
                        <FireIcon className="w-8 h-8 streak-icon"/>
                        <div className="streak-text">
                            <span>{streak}</span> Day Streak!
                        </div>
                    </div>
                )}
                
                <p className="text-gray-600 mb-6">A new, unique mission is generated by our AI every day. Tackle trivia, solve riddles, or crack complex cases to prove your skills!</p>
                
                {missionCompleted ? (
                    <div className="flex flex-col items-center gap-4 text-green-600 mt-4">
                        <CheckCircleIcon className="w-16 h-16" />
                        <p className="text-xl font-semibold">Mission Accomplished!</p>
                        <p className="text-md text-gray-600">You've completed your daily challenge. Come back tomorrow!</p>
                    </div>
                ) : (
                    <div className="mt-6">
                         {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button onClick={handleStartMission} className="btn btn-primary text-lg w-full" disabled={isLoading}>
                            {isLoading ? <Spinner /> : 'Start Mission'}
                        </button>
                    </div>
                )}
                 <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Your Progression</h4>
                    <p className="text-gray-600 mb-4">See all your unlocked roles across the hospital network.</p>
                    <button onClick={() => setView('profile')} className="btn btn-secondary w-full">
                        View My Hospital Roles
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderMissionView = () => {
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

    const renderLeaderboard = () => (
        <div className="card w-full max-w-2xl animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <h2 className="text-3xl font-bold text-center">Leaderboard</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="p-3 text-sm font-semibold tracking-wide text-center">Rank</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">Player</th>
                            <th className="p-3 text-sm font-semibold tracking-wide text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map(({ rank, name, score }) => {
                            const isUser = name === 'You';
                            const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-gray-500';
                            return (
                                <tr key={name} className={`border-b border-gray-100 ${isUser ? 'user-highlight' : ''}`}>
                                    <td className="p-3 text-lg font-bold text-center">
                                        <div className="flex items-center justify-center">
                                            {rank <= 3 ? <MedalIcon className={`w-6 h-6 mr-2 ${rankColor}`} /> : <span className="w-6 mr-2"></span>}
                                            {rank}
                                        </div>
                                    </td>
                                    <td className="p-3 font-semibold">{name}</td>
                                    <td className="p-3 text-right font-mono">{score.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderProfile = () => (
        <div className="card w-full max-w-6xl animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-6">
                <UserIcon className="w-8 h-8 text-blue-500" />
                <h2 className="text-3xl font-bold text-center">Your Profile & Progression</h2>
            </div>

            {/* --- Profile Customization Section --- */}
            <div className="profile-customization-card mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Customize Your Profile</h3>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Avatar Selection */}
                    <div>
                        <h4 className="font-semibold text-lg mb-3">Choose Your Avatar</h4>
                        <div className="avatar-grid mb-4">
                            {predefinedAvatars.map(avatar => (
                                <button key={avatar} onClick={() => setUserAvatar(avatar)} className={`avatar-option ${userAvatar === avatar ? 'selected' : ''}`}>
                                    {avatar}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleGenerateAvatar} className="btn btn-ai w-full" disabled={isAvatarGenerating}>
                            {isAvatarGenerating ? <Spinner size="sm" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                            {isAvatarGenerating ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>

                    {/* Primary Track Selection */}
                    <div>
                        <h4 className="font-semibold text-lg mb-3">Select Primary Track</h4>
                        <div className="space-y-2">
                            {careerTracks.map(track => (
                                <button key={track.name} onClick={() => setPrimaryTrack(track.name)} className={`track-option ${primaryTrack === track.name ? 'selected' : ''}`} data-track={track.name}>
                                    <track.icon className="w-6 h-6" />
                                    <span>{track.name}</span>
                                    {primaryTrack === track.name && <CheckCircleIcon className="w-6 h-6 ml-auto text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Career Progression Section --- */}
            <div className="space-y-8">
                {careerTracks.map(track => {
                    const currentLevelForTrack = track.levels.slice().reverse().find(l => score >= l.minScore) || track.levels[0];
                    return (
                        <div key={track.name} className="track-section" data-track={track.name}>
                            <div className="flex items-center gap-4 mb-4">
                                <track.icon className="w-10 h-10" />
                                <h3 className="text-2xl font-bold">{track.name}</h3>
                            </div>
                            <div className="levels-grid">
                                {track.levels.map(level => {
                                    const isUnlocked = score >= level.minScore;
                                    const isCurrent = level.name === currentLevelForTrack.name;
                                    const badgeClasses = `level-badge ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
        
                                    return (
                                        <div key={level.name} className={badgeClasses} title={`${level.name} - Requires ${level.minScore} Score`}>
                                            <div className="avatar">{level.avatar}</div>
                                            <div className="level-info">
                                                <p className="level-name">{level.name}</p>
                                                <p className="level-score">{level.minScore.toLocaleString()} PTS</p>
                                            </div>
                                            {isCurrent && <span className="current-tag">Current</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const CurrentView = () => {
        switch (view) {
            case 'quiz': return renderMissionView();
            case 'leaderboard': return renderLeaderboard();
            case 'profile': return renderProfile();
            case 'dashboard':
            default: return renderDashboard();
        }
    }

    return (
        <div className="min-h-screen font-sans flex flex-col items-center app-bg">
            <Header
                currentView={view}
                onNavigate={handleNavigate}
                score={score}
                levelName={primaryRankInfo.name}
                userAvatar={userAvatar}
            />
            <main className="w-full flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <CurrentView />
            </main>
        </div>
    );
};

export default App;