import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Analyze image using the selected provider.
 * @param {string} imageBase64 - The image data URL.
 * @returns {Promise<string[]>} - List of detected items/tags.
 */
export const analyzeImage = async (imageBase64) => {
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const apiKey = localStorage.getItem('ai_api_key');

    if (!apiKey) {
        throw new Error("Please configure an API Key in Settings.");
    }

    // Strip header if present to get pure base64 for APIs if needed, 
    // though Gemini SDK handles some formats, usually best to send raw base64 data part.
    const base64Data = imageBase64.split(',')[1];

    if (provider === 'gemini') {
        return analyzeWithGemini(apiKey, base64Data);
    } else if (provider === 'openai') {
        return analyzeWithOpenAI(apiKey, imageBase64); // OpenAI takes full data URI usually
    }

    throw new Error("Unsupported provider");
};

const analyzeWithGemini = async (apiKey, base64Data) => {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "List the main visible items in this image related to storage/inventory. Return ONLY a comma-separated list of items (e.g. 'Winter coat, boots, scarf'). Be concise.";

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return text.split(',').map(s => s.trim()).filter(Boolean);
    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("Failed to analyze image with Gemini.");
    }
};

const analyzeWithOpenAI = async (apiKey, imageUrl) => {
    try {
        const payload = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "List the main visible items in this image related to storage/inventory. Return ONLY a comma-separated list of items (e.g. 'Winter coat, boots, scarf'). Be concise." },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const content = data.choices[0].message.content;
        return content.split(',').map(s => s.trim()).filter(Boolean);

    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Failed to analyze image with OpenAI.");
    }
};
