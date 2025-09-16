export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
    points: number;
}

export type MissionType = 'TRIVIA' | 'RIDDLE' | 'DIAGNOSIS_CHALLENGE' | 'MEDICAL_HISTORY' | 'LAB_SAFETY_SCENARIO' | 'LOGISTICS_PUZZLE' | 'TECH_TROUBLESHOOTING' | 'FACILITIES_CHALLENGE';

export interface Mission {
    type: MissionType;
    title: string;
    description: string;
    questions: QuizQuestion[];
}

// Attempt to dynamically load the Google GenAI client. This will fail in browser environments
// or when the package cannot be used at runtime; callers handle a null result and fall back.
async function loadGenAI() {
    try {
        // Dynamic import so bundlers don't try to include this at build-time for the browser.
        const mod = await import('@google/genai');
        const { GoogleGenAI, Type } = mod as any;

        // Prefer environment variable; if running in a browser, allow an injected window value.
        const apiKey = (typeof process !== 'undefined' && (process.env as any).API_KEY) || (typeof window !== 'undefined' && (window as any).__API_KEY__);

        if (!apiKey) {
            console.warn('Google GenAI API key not found. Falling back to local generator.');
            return null;
        }

        const ai = new GoogleGenAI({ apiKey });
        return { ai, Type } as any;
    } catch (err) {
        console.warn('Google GenAI client unavailable in this environment:', err);
        return null;
    }
}

function deterministicRandom(seed: number) {
    // Simple LCG for deterministic pseudo-randomness based on seed
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

function sampleQuestion(type: MissionType, rnd: () => number): QuizQuestion {
    const pick = (arr: string[]) => arr[Math.floor(rnd() * arr.length)];

    switch (type) {
        case 'RIDDLE':
            return {
                question: 'I can be white, red, or spotted, found in labs and clinics; I help reveal the unseen under light — what am I?',
                options: ['Microscope slide', 'X-ray machine', 'Stethoscope', 'Hemoglobin meter'],
                answer: 'Microscope slide',
                points: 40,
            };
        case 'DIAGNOSIS_CHALLENGE':
            return {
                question: 'A 65-year-old with sudden chest pain and ST-elevations on ECG — what is the most likely diagnosis?',
                options: ['Pulmonary embolism', 'ST-elevation myocardial infarction', 'Pericarditis', 'Aortic dissection'],
                answer: 'ST-elevation myocardial infarction',
                points: 50,
            };
        case 'MEDICAL_HISTORY':
            return {
                question: 'Who is widely credited with developing modern antiseptic surgery practices in the 19th century?',
                options: ['Louis Pasteur', 'Joseph Lister', 'Edward Jenner', 'Alexander Fleming'],
                answer: 'Joseph Lister',
                points: 30,
            };
        case 'LAB_SAFETY_SCENARIO':
            return {
                question: 'A small chemical spill occurs in a lab. What is the immediate correct first step?',
                options: ['Evacuate and notify safety', 'Attempt to clean it immediately', 'Ignore if it seems minor', 'Dilute with water and leave'],
                answer: 'Evacuate and notify safety',
                points: 35,
            };
        case 'LOGISTICS_PUZZLE':
            return {
                question: 'A ward is over capacity and patients wait longer. Which solution best improves throughput?',
                options: ['Increase admission rate', 'Improve patient discharge planning', 'Close beds', 'Reduce staffing'],
                answer: 'Improve patient discharge planning',
                points: 30,
            };
        case 'TECH_TROUBLESHOOTING':
            return {
                question: 'A clinician cannot connect to the hospital Wi‑Fi on their tablet. First troubleshooting step?',
                options: ['Reboot tablet and retry', 'Replace tablet immediately', 'Reset entire network', 'Ignore and use personal hotspot'],
                answer: 'Reboot tablet and retry',
                points: 25,
            };
        case 'FACILITIES_CHALLENGE':
            return {
                question: 'There is a power outage in a non-critical area. What is the highest priority action?',
                options: ['Call maintenance next day', 'Switch affected systems to backup power if available', 'Continue working as normal', 'Evacuate the building'],
                answer: 'Switch affected systems to backup power if available',
                points: 30,
            };
        case 'TRIVIA':
        default:
            const questions = [
                {
                    question: 'Which organ produces insulin?',
                    options: ['Liver', 'Pancreas', 'Kidney', 'Spleen'],
                    answer: 'Pancreas',
                    points: 10,
                },
                {
                    question: 'What blood type is known as the universal donor?',
                    options: ['A', 'B', 'AB', 'O negative'],
                    answer: 'O negative',
                    points: 10,
                },
                {
                    question: 'Which vitamin is essential for blood clotting?',
                    options: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Vitamin D'],
                    answer: 'Vitamin K',
                    points: 20,
                },
            ];
            return questions[Math.floor(rnd() * questions.length)];
    }
}

function buildSampleMission(missionType: MissionType, dateSeed: number): Mission {
    const rnd = deterministicRandom(dateSeed);

    if (missionType === 'TRIVIA') {
        const q1 = sampleQuestion('TRIVIA', rnd);
        const q2 = sampleQuestion('TRIVIA', rnd);
        const q3 = sampleQuestion('TRIVIA', rnd);
        return {
            type: 'TRIVIA',
            title: 'Medical Trivia',
            description: 'Test your knowledge with quick medical questions.',
            questions: [q1, q2, q3],
        };
    }

    const q = sampleQuestion(missionType, rnd);
    return {
        type: missionType,
        title: q.question.length > 40 ? 'Challenge' : 'Quick Question',
        description: 'A generated mission for practice and learning.',
        questions: [q],
    };
}

export async function generateDailyMission(): Promise<Mission> {
    const missionTypes: MissionType[] = [
        'TRIVIA',
        'RIDDLE',
        'DIAGNOSIS_CHALLENGE',
        'MEDICAL_HISTORY',
        'LAB_SAFETY_SCENARIO',
        'LOGISTICS_PUZZLE',
        'TECH_TROUBLESHOOTING',
        'FACILITIES_CHALLENGE',
    ];

    const today = new Date();
    const missionType = missionTypes[today.getDate() % missionTypes.length];

    // Try to use the real AI client; if unavailable, return a deterministic sample mission.
    const client = await loadGenAI();
    if (!client) {
        return buildSampleMission(missionType, Number(today.toDateString().split(' ')[2] || today.getDate()));
    }

    const { ai, Type } = client;

    const quizSchema: any = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                points: { type: Type.INTEGER },
            },
            required: ['question', 'options', 'answer', 'points'],
        },
    };

    let prompt = '';

    switch (missionType) {
        case 'RIDDLE':
            prompt = `Generate a single unique multiple-choice medical riddle as a JSON array containing one object with fields question, options, answer, points.`;
            break;
        case 'DIAGNOSIS_CHALLENGE':
            prompt = `Generate a single diagnostic multiple-choice question (case study) as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'MEDICAL_HISTORY':
            prompt = `Generate a single medical history multiple-choice question as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'LAB_SAFETY_SCENARIO':
            prompt = `Generate a single lab safety scenario multiple-choice question as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'LOGISTICS_PUZZLE':
            prompt = `Generate a single hospital logistics puzzle multiple-choice question as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'TECH_TROUBLESHOOTING':
            prompt = `Generate a single tech troubleshooting multiple-choice question as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'FACILITIES_CHALLENGE':
            prompt = `Generate a single facilities multiple-choice question as a JSON array with one object containing question, options, answer, points.`;
            break;
        case 'TRIVIA':
        default:
            prompt = `Generate three medical trivia multiple-choice questions as a JSON array. Each object must have question, options (4 items), answer, points.`;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
            },
        });

        const jsonText = (response && (response as any).text) ? (response as any).text.trim() : '';
        if (!jsonText) {
            throw new Error('Empty response from AI model');
        }

        const questions = JSON.parse(jsonText) as QuizQuestion[];
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Parsed response is not a non-empty array');
        }

        return {
            type: missionType,
            title: missionType === 'TRIVIA' ? 'Medical Trivia' : 'Daily Mission',
            description: 'AI generated mission',
            questions,
        };
    } catch (err) {
        console.error('Error generating mission with AI, falling back to sample:', err);
        return buildSampleMission(missionType, Number(today.toDateString().split(' ')[2] || today.getDate()));
    }
}

export async function generateAvatarImage(prompt: string): Promise<string> {
    const client = await loadGenAI();
    if (!client) {
        // Return a simple SVG avatar as a data URL so callers can render an image.
        const svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 24 24'><rect width='100%' height='100%' fill='%23eef2ff'/><circle cx='12' cy='8' r='3.2' fill='%238b5cf6'/><rect x='6' y='14' rx='2' ry='2' width='12' height='6' fill='%231f2937'/></svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }

    const { ai } = client as any;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response && response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }

        throw new Error('No images returned from AI');
    } catch (err) {
        console.error('Error generating avatar image with AI, returning placeholder:', err);
        const svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 24 24'><rect width='100%' height='100%' fill='%23eef2ff'/><circle cx='12' cy='8' r='3.2' fill='%238b5cf6'/><rect x='6' y='14' rx='2' ry='2' width='12' height='6' fill='%231f2937'/></svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
}
