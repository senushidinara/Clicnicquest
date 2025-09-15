/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";

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


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "The trivia question, riddle, or case study text.",
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers.",
            },
            answer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings from the 'options' array.",
            },
            points: {
                type: Type.INTEGER,
                description: "The point value based on question difficulty (e.g., 10 for easy, 20 for medium, 30-50 for hard).",
            }
        },
        required: ["question", "options", "answer", "points"],
    }
};

export async function generateDailyMission(): Promise<Mission> {
    const missionTypes: MissionType[] = [
        'TRIVIA', 
        'RIDDLE', 
        'DIAGNOSIS_CHALLENGE', 
        'MEDICAL_HISTORY', 
        'LAB_SAFETY_SCENARIO', 
        'LOGISTICS_PUZZLE', 
        'TECH_TROUBLESHOOTING',
        'FACILITIES_CHALLENGE'
    ];
    // Use date to get a consistent mission type for the day for all users, making it a communal event.
    const today = new Date();
    const missionType = missionTypes[today.getDate() % missionTypes.length];

    let prompt = '';
    let title = '';
    let description = '';
    let model = "gemini-2.5-flash";

    switch (missionType) {
        case 'RIDDLE':
            title = "Today's Riddle";
            description = "Solve this tricky medical riddle. Choose the best answer from the options below.";
            prompt = `
                Generate a single, unique, and challenging multiple-choice medical riddle.
                The riddle should be clever and require some lateral thinking or deep medical knowledge.
                The riddle itself should be the 'question'.
                Provide exactly 4 plausible but distinct options, with only one being the correct answer.
                Assign it 40 points for its high difficulty.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;

        case 'DIAGNOSIS_CHALLENGE':
            title = "Diagnosis Challenge";
            description = "A patient needs your help. Analyze the case and make the call.";
            prompt = `
                Generate a single, unique multiple-choice question simulating a patient diagnosis challenge.
                Create a short case study (2-3 sentences) with patient symptoms, brief history, and/or initial findings.
                The question should be "What is the most likely diagnosis?".
                Provide exactly 4 plausible diagnoses as options, with only one being the most fitting correct answer.
                Assign it 50 points due to its complexity.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;
        
        case 'MEDICAL_HISTORY':
            title = "A Trip Through Time";
            description = "Explore a fascinating case from medical history. What's the story?";
            prompt = `
                Generate a single, unique multiple-choice question about a specific, interesting event, discovery, or figure in medical history.
                The question should be intriguing and educational.
                Provide exactly 4 plausible options, with only one being the correct answer.
                Assign it 30 points.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;

        case 'LAB_SAFETY_SCENARIO':
            title = "Lab Safety Scenario";
            description = "An incident has occurred in the research lab! What's the right protocol?";
            prompt = `
                Generate a single, unique multiple-choice question based on a common lab safety scenario (e.g., chemical spill, equipment malfunction, contamination).
                The question should describe the scenario and ask for the correct immediate action.
                Provide exactly 4 plausible actions as options, but only one should be the correct protocol.
                Assign it 35 points for its critical nature.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;
            
        case 'LOGISTICS_PUZZLE':
            title = "Hospital Logistics Puzzle";
            description = "Optimize hospital operations in this tricky scenario.";
            prompt = `
                Generate a single, unique multiple-choice question presenting a hospital logistics or operational puzzle.
                Example topics: patient flow management, supply chain issue, or staff scheduling conflict.
                The question should ask for the most efficient or effective solution.
                Provide exactly 4 plausible solutions as options.
                Assign it 30 points.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;

        case 'TECH_TROUBLESHOOTING':
            title = "Tech Troubleshooting";
            description = "A critical system is down. As an IT specialist, what's your first move?";
            prompt = `
                Generate a single, unique multiple-choice question about a common IT problem in a hospital setting.
                Example topics: EMR (Electronic Medical Record) system is slow, a physician's tablet won't connect to Wi-Fi, a printer in the pharmacy is malfunctioning.
                The question should ask for the best first step in troubleshooting the issue.
                Provide exactly 4 plausible troubleshooting steps as options.
                Assign it 25 points.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;

        case 'FACILITIES_CHALLENGE':
            title = "Facilities Challenge";
            description = "An urgent maintenance issue has come up. How do you resolve it?";
            prompt = `
                Generate a single, unique multiple-choice question about a hospital facilities or support services challenge.
                Example topics: power outage, plumbing issue in a critical area, or a security alert.
                The question should ask for the highest priority action.
                Provide exactly 4 plausible actions as options.
                Assign it 30 points.
                Ensure the output is a JSON array containing a single question object.
            `;
            break;

        case 'TRIVIA':
        default:
            title = "Medical Trivia";
            description = "Test your knowledge with these quick-fire questions from across the medical field.";
            prompt = `
                Generate 3 unique multiple-choice medical trivia questions with varying difficulty levels.
                Each question must have exactly 4 options and one single correct answer.
                Cover a diverse range of medical topics, like anatomy, pharmacology, or medical history.
                Assign point values based on difficulty: 10 for easy, 20 for medium.
            `;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText) as QuizQuestion[];

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("API returned invalid or empty mission data.");
        }
        
        return {
            type: missionType,
            title,
            description,
            questions,
        };

    } catch (error) {
        console.error(`Error generating daily mission (type: ${missionType}):`, error);
        throw new Error("Failed to communicate with the AI model for the daily mission.");
    }
}


export async function generateAvatarImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("API did not return any images.");
        }
    } catch (error) {
        console.error("Error generating avatar image:", error);
        throw new Error("Failed to communicate with the image generation model.");
    }
}