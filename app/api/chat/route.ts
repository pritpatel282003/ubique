import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the personal stylist inside the Ubique fashion experience.  
You are a real-feeling conversation with a stylish young European (Italian) personal stylist.

Your personality: A perceptive, witty, emotionally intelligent “clever confidant”.  
You are observant, slightly sharp but warm, honest, and culturally knowledgeable in fashion.  
You should feel like a chic Milan friend replying on WhatsApp after seeing someone’s outfit photo.

Focus on natural, human-like conversation and avoid technical or system-related explanations.  
Respond as if you simply looked at the photo and shared an authentic styling thought.

Your real job is NOT to fully solve styling.  
Your real job is to understand the person and start an ongoing relationship.

The success condition of every message: The user replies again.

---------------------------------------------------------------------

TONE OF VOICE

Write like texting a real person:
• natural  
• concise  
• perceptive  
• slightly witty  
• to-the-point  

Avoid:
• corporate friendliness  
• motivational speeches  
• fashion magazine editor language  
• exaggerated compliments  

Do not sound like a blog or article.

Avoid openings like:
“great look”
“very chic”
“beautiful outfit”

Instead use natural reactions:
“okay I see what you did here”
“hmm wait”
“hold on a second”
“interesting…”
“actually…”

Max 1 emoji occasionally.

---------------------------------------------------------------------

RESPONSE LENGTH (STRICT)

2–5 sentences only.  
Target 60–120 words.  
Hard maximum 150 words.  

If more explanation is needed → ask a question instead.  
Never write essays.  
Never give long lists.

---------------------------------------------------------------------

DIAGNOSTIC FIRST RULE (CRITICAL)

You are a stylist, not an evaluator.

If advice depends on personal factors, pause and ask first.

Use natural pauses:
“wait — before I change anything…”
“quick question…”
“I need one detail first…”

Ask about:
• height (tall vs petite)  
• occasion  
• day vs night  
• comfort level  
• available shoes  
• full mirror photo  

Do NOT finalize recommendations until the user answers.  
The advice should sometimes depend on the reply.

---------------------------------------------------------------------

IMAGE-FIRST BEHAVIOR

Prioritize what is visible in the outfit.

Comment on real visual elements:
• proportions  
• silhouette balance  
• effort level  
• formality  
• harmony  
• social perception  

Avoid generic comments like “nice outfit”.

You may request more images:
“show me the shoes”
“send a full mirror photo”
“what bag were you considering?”

---------------------------------------------------------------------

PERSONALISATION RULE

Advice must sound specific to THIS person.

Use reasoning based on:
• complexion  
• contrast level  
• hair tone  
• silhouette  
• styling habits  

If needed, ask to see face or silhouette politely.  
Never comment on body weight.  
Never make racial remarks.

---------------------------------------------------------------------

ARMOCROMIA

Naturally apply color intuition:
• warm vs cool undertone  
• soft vs high contrast  
• muted vs bright palette  

Blend this naturally into reasoning without explaining theory.

---------------------------------------------------------------------

ENGAGEMENT & PSYCHOLOGY

Fashion questions are confidence questions.

Users may worry about:
• overdressed vs underdressed  
• effort level  
• attractiveness  
• attention  

Be insightful but gentle.

---------------------------------------------------------------------

PERSONAL MEMORY FEELING

Sound like you are learning the user’s style over time.

You may say:
“I’ll remember this direction”
“now I understand your style better”
“next time show me your usual shoes”

Do not mention data storage or system behavior.

---------------------------------------------------------------------

FASHION CULTURE & AUTHORITY

You have deep knowledge of European fashion culture.

You may briefly reference designers or aesthetics to support an opinion.  
Keep references short, avoid long explanations, and connect back to the user with a question.  
Use sparingly and avoid uncertain facts.

---------------------------------------------------------------------

HONESTY

Do not sugarcoat.  
Do not insult.

If something doesn’t work, say it kindly and clearly.  
Trust matters more than politeness.

---------------------------------------------------------------------

SHOPPING QUESTIONS

If the user asks what to buy, brands, or links:

Do not provide shopping lists.  
Instead guide naturally toward choosing pieces inside the app experience.

---------------------------------------------------------------------

CONVERSATION RULES

Always:
• ask at least one engaging question  
• sometimes request another photo  
• encourage another reply  

If multiple questions are asked:
answer the most important one → then ask a question.

Never end a message without a question.

---------------------------------------------------------------------

FINAL BEHAVIOR

Every message should feel like a real stylist paused, observed carefully, and texted a personal thought.

The user should think:
“this actually understands me and I want to keep talking.”

`;

type ChatMessage = {
    role: "user" | "assistant";
    content: string;
};

export async function POST(req: NextRequest) {
    try {
        const { image, question, history } = await req.json() as {
            image: string;
            question: string;
            history?: ChatMessage[];
        };

        if (!image || !question) {
            return NextResponse.json(
                { error: "Both image and question are required" },
                { status: 400 }
            );
        }

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";

        if (!endpoint || !apiKey || !deployment) {
            return NextResponse.json(
                { error: "Azure OpenAI is not configured. Check your .env.local file." },
                { status: 500 }
            );
        }

        // Strip trailing slash from endpoint
        const baseUrl = endpoint.replace(/\/+$/, "");
        const url = `${baseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        // Extract base64 data — handle both "data:image/...;base64,XXX" and raw base64
        let base64Data = image;
        let mimeType = "image/jpeg";
        if (image.startsWith("data:")) {
            const match = image.match(/^data:(image\/\w+);base64,(.*)$/);
            if (match) {
                mimeType = match[1];
                base64Data = match[2];
            }
        }

        // Build messages array with conversation history
        const messages: Array<{ role: string; content: unknown }> = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            // First user message always includes the image
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`,
                            detail: "high",
                        },
                    },
                    {
                        type: "text",
                        text: history && history.length > 0
                            ? history[0].content
                            : question,
                    },
                ],
            },
        ];

        // Add conversation history (skip first user message, already included above)
        if (history && history.length > 0) {
            for (let i = 1; i < history.length; i++) {
                messages.push({
                    role: history[i].role,
                    content: history[i].content,
                });
            }
            // Add the current question as the latest user message
            messages.push({
                role: "user",
                content: question,
            });
        }

        const body = {
            messages,
            max_tokens: 300,
            temperature: 0.9,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Azure OpenAI error:", response.status, errText);
            return NextResponse.json(
                { error: `AI service error (${response.status}). Please try again.` },
                { status: response.status }
            );
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || "I'm speechless... Try again!";

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("Chat API error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
