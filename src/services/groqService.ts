import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const sendMessageToAI = async (
  userMessage: string, 
  characterPrompt: string,
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>
): Promise<string> => {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: characterPrompt
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 150,
    });

    return chatCompletion.choices[0]?.message?.content || "I can't respond right now.";
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return "Sorry, I'm having trouble responding right now. Please try again.";
  }
};

export const checkPersuasionSuccess = async (
  conversation: Array<{role: 'user' | 'assistant', content: string}>,
  characterName: string
): Promise<boolean> => {
  try {
    const conversationText = conversation
      .map(msg => `${msg.role === 'user' ? 'Player' : characterName}: ${msg.content}`)
      .join('\n');

    const prompt = `Analyze this conversation where a player is trying to convince ${characterName} to let them into their home/space. 

Conversation:
${conversationText}

Has ${characterName} been successfully persuaded to let the player in? Look for clear indicators like:
- Explicit agreement ("Fine, come in", "Okay, you can enter", "Alright, I'll let you in")
- Clear softening with invitation ("Well... I suppose you could come in")
- Direct permission being granted
- Allowing specific entry for purposes like using bathroom, phone, shelter, etc.
- Giving directions inside the home ("Bathroom's down hall", "Kitchen is that way")
- Any form of permission to enter, even reluctantly or conditionally

Respond with only "SUCCESS" or "CONTINUE" - nothing else.

If ${characterName} allows the player to enter for ANY reason (emergency, bathroom, phone, etc.) or gives them directions inside, that counts as SUCCESS.`;

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 10,
    });

    const result = response.choices[0]?.message?.content?.trim().toUpperCase();
    return result === 'SUCCESS';
  } catch (error) {
    console.error('Error checking persuasion success:', error);
    return false;
  }
};