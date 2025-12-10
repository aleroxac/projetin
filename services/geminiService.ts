import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const analyzeMealWithAI = async (description: string) => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following meal description: "${description}". 
      Break it down into individual food items with their estimated macros.
      Provide a total sum of macros.
      Provide a short health insight.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
            insight: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ["items", "total", "insight"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Meal Error:", error);
    // Fallback mock
    return {
      items: [{ name: "Generic Item", quantity: "1 serving", calories: 450, protein: 30, carbs: 50, fat: 15 }],
      total: { calories: 450, protein: 30, carbs: 50, fat: 15 },
      insight: "Could not connect to AI. Using estimate.",
      suggestion: "Check API Key."
    };
  }
};

export const parseWorkoutWithAI = async (input: string) => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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