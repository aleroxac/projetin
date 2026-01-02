
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMealWithAI = async (description: string, goal: string, remainingKcal: number) => {
  try {
    // Using gemini-3-flash-preview for general text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following meal description: "${description}". 
      User context: Goal is ${goal}, remaining calories for today is ${remainingKcal}kcal.
      
      Tasks:
      1. Break down into individual food items with estimated macros.
      2. Sum total macros.
      3. Classify the meal Tier (S, A, B, C, or D) based on the user's goal and nutrient density. 
         - S: Perfect for goal, nutrient dense.
         - A: Very good.
         - B: Average.
         - C: Poor macro ratio or high processing.
         - D: Significant setback for goal.
      4. Suggest 1 or 2 'Smart Swaps' (healthier/less caloric alternatives for items in the meal).
      5. Provide a short health insight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                    }
                }
            },
            total: {
                type: Type.OBJECT,
                properties: {
                    calories: { type: Type.NUMBER },
                    protein: { type: Type.NUMBER },
                    carbs: { type: Type.NUMBER },
                    fat: { type: Type.NUMBER },
                }
            },
            tier: { type: Type.STRING, enum: ["S", "A", "B", "C", "D"] },
            swaps: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
            },
            insight: { type: Type.STRING }
          },
          required: ["items", "total", "tier", "insight"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Meal Error:", error);
    return null;
  }
};

export const parseWorkoutWithAI = async (input: string) => {
  try {
    // Using gemini-3-flash-preview for general text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this workout text into a structured JSON format. 
      Input: "${input}". 
      Infer the muscle group for each exercise. 
      Assume 'sets' if not specified implies working sets.
      For sets: assume standard structure like "3x10" means 3 sets of 10 reps.
      If weights are provided, include them.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the workout session" },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  muscleGroup: { type: Type.STRING },
                  equipment: { type: Type.STRING },
                  sets: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            reps: { type: Type.NUMBER },
                            weight: { type: Type.NUMBER },
                            type: { type: Type.STRING, enum: ["WARMUP", "WORKING", "FEEDER"] }
                        }
                    }
                  },
                  restSeconds: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Workout Error:", error);
    return null;
  }
};
