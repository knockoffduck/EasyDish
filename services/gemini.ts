const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-3-flash-preview'; // Or your preferred version

export const formatRecipeWithAI = async (importText: string) => {
  const systemPrompt = `You are a professional chef's assistant. Format the messy text into a clean JSON object.
    1. Simplify instructions into clear, numbered steps.
    2. Extract kitchen equipment ['Slow Cooker', 'Air Fryer', 'Oven', 'Wok', 'Instant Pot', 'Stovetop'] into a 'tags' array.
    3. IMPORTANT: Remove any equipment names from the 'title' string.
    4. If input is already formatted with specified steps do not change the steps.
    5. Format the ingredients
    Format: { "title": string, "prepTime": string, "servings": string, "tags": [string], "ingredients": [{ "name": string, "amount": string, "category": string }], "steps": [string] }`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: importText }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2, // Lower temperature for more consistent JSON structure
          },
        }),
      }
    );

    const data = await response.json();

    // Extract the text from the Gemini response and parse the JSON string
    const jsonString = data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Import failed:', error);
    throw new Error('Failed to process recipe text.');
  }
};
