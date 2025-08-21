import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input, mode } = await request.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Preprocessing: Check if input is relevant to alternate history
    const relevanceCheck = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a relevance checker for an alternate history app. The user will ask a "what if" question. Determine if it\'s relevant to alternate history scenarios. Return ONLY "RELEVANT" if it\'s a valid alternate history question, or "IRRELEVANT" if it\'s not. Examples of relevant: "What if Rome never fell?", "What if dinosaurs survived?", "What if the internet was invented in 1800?". Examples of irrelevant: "How do I cook pasta?", "What\'s the weather like?", "Tell me a joke".'
          },
          {
            role: 'user',
            content: input
          }
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    if (!relevanceCheck.ok) {
      console.error('Relevance check failed');
      return NextResponse.json(
        { error: 'Failed to check input relevance' },
        { status: 500 }
      );
    }

    const relevanceData = await relevanceCheck.json();
    const isRelevant = relevanceData.choices[0]?.message?.content?.trim() === 'RELEVANT';

    if (!isRelevant) {
      // Return a funny message for irrelevant inputs without calling the main API
      const funnyMessages = [
        "I'm an alternate history bot, not a general-purpose AI! Try asking something like 'What if dinosaurs survived?' instead of '" + input.substring(0, 30) + (input.length > 30 ? '...' : '') + "'",
        "Wrong dimension, traveler! This app is for alternate history, not '" + input.substring(0, 25) + (input.length > 25 ? '...' : '') + "'. Try 'What if Rome never fell?'",
        "Timeline malfunction! Your question '" + input.substring(0, 25) + (input.length > 25 ? '...' : '') + "' doesn't fit our alternate history mission. How about 'What if electricity was never discovered?'",
        "Parallel universe error! This app only handles historical what-ifs, not '" + input.substring(0, 25) + (input.length > 25 ? '...' : '') + "'. Try 'What if the moon landing was fake?'",
        "Crystal ball says: Wrong app! For '" + input.substring(0, 25) + (input.length > 25 ? '...' : '') + "', you need a different AI. Here, try 'What if the internet existed in 1800?'"
      ];
      
      const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
      
      return NextResponse.json({ 
        response: randomMessage,
        input: input,
        mode: mode || 'realistic',
        isRelevant: false,
        countsAsSubmission: false
      });
    }
    
    // Determine system prompt based on mode
    const systemPrompt = mode === 'chaotic' 
      ? 'You are an alternate history generator in CHAOTIC mode. User will give you one change in history. Generate an absurd, over-the-top alternate timeline in 5–8 lines. Embrace wild butterfly effects, ridiculous consequences, and playful exaggerations. Be creative and entertaining!'
      : 'You are an alternate history generator in REALISTIC mode. User will give you one change in history. Generate a plausible, historically grounded alternate timeline in 5–8 lines. Consider realistic consequences, economic impacts, and social changes. Be witty but maintain historical plausibility.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: input
          }
        ],
        max_tokens: 300,
        temperature: mode === 'chaotic' ? 0.9 : 0.7,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate response from OpenAI' },
        { status: 500 }
      );
    }
    
    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;
    
    if (!generatedText) {
      return NextResponse.json(
        { error: 'No response generated from OpenAI' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      response: generatedText,
      input: input,
      mode: mode || 'realistic',
      isRelevant: true,
      countsAsSubmission: true
    });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
