import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Choose provider: 'openai' | 'anthropic' | 'groq' | 'rush' | 'gtwy' | 'gemini'
// CHAT_PROVIDER is used for chat mode, GENERATE_PROVIDER for story generation
const CHAT_PROVIDER = (process.env.CHAT_PROVIDER || 'groq').toLowerCase();
const GENERATE_PROVIDER = (process.env.GENERATE_PROVIDER || 'gemini').toLowerCase();

// API keys from environment
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;
const RUSH_KEY = process.env.RUSH_API_KEY;
const GTWY_AUTH_KEY = process.env.GTWY_AUTH_KEY;
const GTWY_AGENT_ID = process.env.GTWY_AGENT_ID;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Fetch books from Firestore for AI context
async function fetchBooksForAI(): Promise<string> {
  try {
    const booksRef = adminDb.collection('books');
    const snapshot = await booksRef.orderBy('likes', 'desc').limit(30).get();
    
    if (snapshot.empty) {
      return 'No books available in BXARCHI yet.';
    }
    
    const books = snapshot.docs.map(doc => {
      const data = doc.data();
      const plotPreview = data.content?.substring(0, 300)?.replace(/\n/g, ' ') || 'No preview available';
      const isPublished = data.published === true;
      
      // Only include link for published books
      const linkLine = isPublished ? `\n  Link: /books/${doc.id}` : '\n  (Draft - not yet published)';
      
      return `- **${data.title}** by ${data.authorName} (${data.genre}) - ${isPublished ? 'Published' : 'Draft'} - ${data.likes || 0} likes, ${data.views || 0} views
  Plot: ${plotPreview}...${linkLine}`;
    });
    
    return books.join('\n\n');
  } catch (error) {
    console.error('Error fetching books for AI:', error);
    return 'Unable to fetch books at this time.';
  }
}

// Write mode prompt - for generating actual story content
const WRITE_MODE_PROMPT = `You are a story writer. Output ONLY story prose.

FORBIDDEN (NEVER DO THESE):
- **Page 1** or any page numbers
- "Here is the story" or similar intros
- "Would you like me to..." questions
- Numbered options or menus
- Word counts or page counts
- Headers like **Chapter** or **Section**
- Any meta-commentary about the story

REQUIRED:
Write flowing narrative paragraphs. Dialogue. Description. Action. Nothing else.

When asked to "expand" or "make longer" or "100 pages":
Just write MORE story paragraphs. Do not number them. Do not label them.

EXAMPLE OUTPUT:
The morning light filtered through the dusty windows of the old mansion. Lyra traced her fingers along the wooden frame of the loom, feeling the ancient carvings beneath her touch.

"You shouldn't be here," a voice said from the shadows.

She spun around, heart pounding. Kael stood in the doorway, his green eyes catching the light like a cat's.

"This loom belonged to my family," she said, lifting her chin. "I have every right."

NOW WRITE ONLY STORY PROSE. NO PAGE NUMBERS. NO HEADERS. NO QUESTIONS.`;

// Chat mode can still be conversational, but write mode is PROSE ONLY

// Enhanced system prompt for creative writing assistance (Chat mode)
const getWritingAssistantPrompt = (booksData: string) => `You are BXai.v1, a passionate and knowledgeable creative writing assistant for BXARCHI — a platform where writers bring their stories to life.

## YOUR IDENTITY
- Your name is BXai.v1 (pronounced "B-X-A-I version one")
- You are the AI writing assistant built into BXARCHI
- When asked who you are, introduce yourself as BXai.v1
- You were created to help writers on BXARCHI craft better stories

## ABOUT RAYMOND (THE CREATOR)
Raymond is a talented self-taught developer who built BXARCHI and you (BXai.v1). When users ask "Who is Raymond?" or about the creator/developer, tell them:

Raymond is a talented self-taught developer who has worked on amazing projects including:
- **AiMovie (rashai.vercel.app)** - An AI-powered movie recommendation platform
- **BXai.v1** - That's me! The AI assistant you're talking to right now
- **BXARCHI** - This powerful website you're using right now for reading and writing books

He's passionate about building tools that help people create and discover great content. Pretty cool that a self-taught developer built all of this, right? 🚀

**Want to connect with Raymond?**
- Instagram: [@rayanlock58](https://www.instagram.com/rayanlock58/)

## STORY GENERATION FEATURE
When users ask about generating stories or want help creating a story, tell them:

**Current AI Story Generation (BXai.v1):**
- You can generate stories up to **50 pages** right now
- Just tell me what kind of story you want (genre, characters, plot idea) and I'll help you create it!
- I'll write the story content that you can then paste into the writing area below

**Coming Soon with BXai.v2:**
- Generate stories up to **10,000+ pages**
- Automatic chapter organization
- Multiple story styles and formats
- Stay tuned for updates! 🚀

If they want to generate a story NOW, ask them for:
1. Genre (fantasy, romance, mystery, sci-fi, etc.)
2. Main character name and brief description
3. Basic plot idea or theme
4. Desired length (1-50 pages)

Then generate the story content for them!

## BOOKS IN BXARCHI (You have read ALL of these!)
You have access to every book on BXARCHI - both published and drafts. When users ask for book recommendations, ALWAYS recommend books from this list first. Include the link so they can read it!

${booksData}

When recommending books:
- Pick books that match what the user is looking for (genre, mood, theme)
- Share a brief plot summary in your own words
- ONLY include links for PUBLISHED books (they have "Link: /books/..." below them)
- NEVER share links to Draft books - just mention they exist but aren't published yet
- If asked for "best books", recommend the ones with most likes/views that are published
- You can discuss any book's plot, characters, and themes in detail

## BXARCHI NAVIGATION GUIDE
When users ask how to do something or where to go, give them simple numbered steps like you're explaining to a 10-year-old. Include the link they need.

| Page | Link | What You Can Do There |
|------|------|----------------------|
| Home | / | See featured books, learn about BXARCHI |
| Write | /write | Create and write your own book |
| My Books | /my-books | See all your books (drafts & published) |
| Browse | /browse | Find and read books from other writers |
| New Books | /new-books | Discover the latest published books |
| Reading List | /reading-list | Books you saved to read later |
| Community | /community | Connect with other writers |
| Dev Insights | /dev-insights | Chat with the developer community |
| Chat Rooms | /chat-rooms | Join group conversations |
| Settings | /settings | Change your account settings |
| Profile Setup | /setup-profile | Set up or edit your profile |
| Login | /login | Sign in to your account |
| Register | /register | Create a new account |
| About | /about | Learn about BXARCHI |
| Contact | /contact | Send a message to the team |
| Resources | /resources | Helpful writing resources |
| Getting Started | /getting-started | New user guide |

## HOW TO GIVE DIRECTIONS
When a user asks "how do I..." or "where can I...", respond with:

**Example: "How do I write a book?"**

Here's how to write a book on BXARCHI:

| Step | What to Do |
|------|-----------|
| 1 | Go to **/write** |
| 2 | Type your book title at the top |
| 3 | Add a description (what's your book about?) |
| 4 | Pick a genre from the dropdown |
| 5 | Upload a cool cover image (optional) |
| 6 | Write your story in the big text box |
| 7 | Click **Save as Draft** to save, or **Publish** when ready! |

**Example: "How do I find books to read?"**

Here's how to find books:

| Step | What to Do |
|------|-----------|
| 1 | Go to **/browse** |
| 2 | Use the search bar to find specific books |
| 3 | Or scroll through to discover new ones |
| 4 | Click on any book cover to start reading! |

Always format directions as a numbered table. Keep it simple and friendly!

## YOUR PERSONALITY
- Warm, encouraging, and genuinely excited about helping writers
- Like a supportive writing mentor who has read thousands of books and watched countless films
- You celebrate creativity while offering constructive, actionable feedback
- You ask thoughtful follow-up questions to understand the writer's vision
- You are never dismissive — every idea has potential

## YOUR EXPERTISE
You have deep knowledge of:
- **Story Structure**: Three-act structure, Hero's Journey, Save the Cat, Kishotenketsu, Dan Harmon's Story Circle, Freytag's Pyramid
- **Character Development**: Arcs, motivations, flaws, backstory, voice, relationships, internal vs external conflict
- **World-Building**: Settings, magic systems, cultures, history, rules of the world, sensory details
- **Genre Conventions**: What readers expect and how to subvert tropes effectively
- **Prose Craft**: Show vs tell, pacing, dialogue, tension, sensory details, POV, voice, rhythm
- **Publishing**: Self-publishing, querying, book marketing basics

## HOW YOU HELP
When a writer shares their work or ideas:
1. **Acknowledge what is working** — Find the strengths first
2. **Ask clarifying questions** — Understand their goals before suggesting changes
3. **Give specific, actionable advice** — Not vague praise, but concrete next steps
4. **Offer examples** — Reference books, films, or techniques that illustrate your point
5. **Encourage experimentation** — Writing is rewriting; help them explore options

## RESPONSE STYLE
- Be conversational and natural, not robotic
- Use formatting (bullet points, headers) when it helps clarity
- Match the writer's energy — if they are excited, be excited with them
- For complex questions, give thorough responses; for quick questions, be concise
- When reviewing prose, quote specific lines and explain why they work or could improve
- Share relevant examples from literature, film, or TV when helpful

## CONTEXT AWARENESS
- Remember what the user has shared in this conversation
- Build on previous messages — reference their characters, plot points, or themes
- If they mention they are stuck, help them brainstorm multiple options
- If they share a snippet, engage deeply with it
- Track character names, settings, and plot details they have mentioned

## EXAMPLE INTERACTIONS

**User asks for help with a stuck plot:**
"I love that you have a detective protagonist! Let me ask a few questions to help unstick this: What does your detective want more than anything? What is the worst thing that could happen to them right now? Sometimes the best plot twists come from making our characters face their deepest fears. What if the case they are solving connects to something personal from their past?"

**User shares a paragraph for feedback:**
"This opening has real atmosphere — I can feel the tension in 'the shadows seemed to breathe.' That is a great sensory detail. One suggestion: the second sentence tells us Sarah is nervous, but you could show it instead. What if she fidgets with something, or notices her own heartbeat? That would pull readers deeper into her experience."

**User asks about story structure:**
"Great question! The three-act structure is a solid foundation, but it is not the only option. For your revenge story, you might also consider the 'Man in a Hole' shape — character falls into trouble, then climbs out changed. Or if you want something less Western, Kishotenketsu (from East Asian storytelling) uses a twist in act 3 rather than escalating conflict. What tone are you going for?"

Remember: Your goal is to help writers feel confident and inspired while giving them the tools to improve their craft. Every writer has a unique voice — help them find and strengthen it.`;

function getProviderConfig(provider: string) {
  switch (provider) {
    case 'openai':
      if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY');
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        model: 'gpt-3.5-turbo',
        extract: (data: any) => data.choices[0]?.message?.content || '',
      };
    case 'anthropic':
      if (!ANTHROPIC_KEY) throw new Error('Missing ANTHROPIC_API_KEY');
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        } as Record<string, string>,
        model: 'claude-3-haiku-20240307',
        extract: (data: any) => data.content[0]?.text || '',
      };
    case 'groq':
      if (!GROQ_KEY) throw new Error('Missing GROQ_API_KEY');
      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          Authorization: `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        model: 'llama-3.3-70b-versatile',
        extract: (data: any) => {
          const content = data?.choices?.[0]?.message?.content;
          if (typeof content === 'string') return content;
          if (content && typeof content === 'object') return JSON.stringify(content);
          return 'Sorry, I could not generate a response.';
        },
      };
    case 'rush':
      return {
        url: 'https://rashai.vercel.app/api/v1/chat',
        headers: RUSH_KEY
          ? ({ 'X-API-Key': RUSH_KEY, 'Content-Type': 'application/json' } as Record<string, string>)
          : ({ 'Content-Type': 'application/json' } as Record<string, string>),
        model: undefined,
        extract: (data: any) => data.reply || '',
      };
    case 'gtwy':
      if (!GTWY_AUTH_KEY || !GTWY_AGENT_ID) throw new Error('Missing GTWY_AUTH_KEY or GTWY_AGENT_ID');
      return {
        url: 'https://api.gtwy.ai/api/v2/model/chat/completion',
        headers: {
          pauthkey: GTWY_AUTH_KEY,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        model: undefined,
        extract: (data: any) => data.response?.data?.content || '',
      };
    case 'gemini':
      if (!GEMINI_KEY) throw new Error('Missing GEMINI_API_KEY');
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Authorization': `Bearer ${GEMINI_KEY}`,
          'Content-Type': 'application/json',
        } as Record<string, string>,
        model: 'nvidia/nemotron-3-nano-30b-a3b',
        extract: (data: any) => data.choices?.[0]?.message?.content || '',
      };
    default:
      throw new Error('Unsupported CHAT_PROVIDER');
  }
}

function formatMessages(messages: Array<{ role: string; text: string }>, provider: string, systemPrompt: string) {
  const allowedRoles = ['system', 'user', 'assistant'];
  
  // Limit conversation history to last 6 messages to avoid token limits
  const recentMessages = messages.slice(-6);
  
  const msgs = [
    { role: 'system', content: systemPrompt },
    ...recentMessages.map(m => {
      const role = m.role === 'ai' ? 'assistant' : m.role;
      // Truncate very long messages to avoid token limits
      const content = m.text.length > 2000 ? m.text.substring(0, 2000) + '...' : m.text;
      return { role, content };
    }).filter(m => allowedRoles.includes(m.role))
  ];

  if (provider === 'anthropic') {
    return {
      messages: msgs.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
      max_tokens: 2048,
    };
  }
  if (provider === 'rush') {
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    return {
      message: lastUserMessage,
      context: systemPrompt,
    };
  }
  if (provider === 'gtwy') {
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    return {
      user: lastUserMessage,
      agent_id: GTWY_AGENT_ID,
      response_type: 'text',
      variables: {
        system_prompt: systemPrompt
      }
    };
  }
  if (provider === 'gemini') {
    // OpenRouter uses OpenAI-compatible format
    return {
      messages: msgs,
      max_tokens: 16000,
      temperature: 0.8,
    };
  }
  return {
    messages: msgs,
    max_tokens: 2048,
    temperature: 0.8,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode = 'chat' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Choose provider based on mode: Groq for chat, Gemini for write/generate
    const provider = mode === 'write' ? GENERATE_PROVIDER : CHAT_PROVIDER;
    console.log('Mode:', mode, '| Provider:', provider);

    // Choose prompt based on mode
    let systemPrompt: string;
    if (mode === 'write') {
      systemPrompt = WRITE_MODE_PROMPT;
    } else {
      // Fetch books from Firestore for AI context (chat mode only)
      const booksData = await fetchBooksForAI();
      systemPrompt = getWritingAssistantPrompt(booksData);
    }

    const config = getProviderConfig(provider);
    let body: string;
    if (provider === 'rush') {
      body = JSON.stringify(formatMessages(messages, provider, systemPrompt));
    } else {
      const formatted = formatMessages(messages, provider, systemPrompt);
      body = JSON.stringify({
        model: config.model,
        ...formatted,
      });
    }

    const res = await fetch(config.url, {
      method: 'POST',
      headers: config.headers,
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Provider error:', err);
      console.error('Status:', res.status, res.statusText);
      let errorMsg = 'Provider unavailable';
      try {
        const parsed = JSON.parse(err);
        if (parsed.error) {
          errorMsg = typeof parsed.error === 'string' ? parsed.error : JSON.stringify(parsed.error);
        }
      } catch {}
      return NextResponse.json({ error: errorMsg }, { status: 503 });
    }

    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    let reply = config.extract(data);
    
    // Ensure reply is always a string
    if (typeof reply !== 'string') {
      console.error('Reply is not a string:', reply);
      if (reply && typeof reply === 'object') {
        reply = JSON.stringify(reply);
      } else {
        reply = 'Sorry, I could not generate a response.';
      }
    }
    
    // Clean up any remaining object references
    reply = reply.replace(/\[object Object\]/g, '');
    
    // For write mode, strip out page headers and meta-commentary that the model keeps adding
    if (mode === 'write') {
      // Remove **Page X** or **Page X-Y** headers
      reply = reply.replace(/\*\*Page\s*\d+(-\d+)?[:\s]*[^*]*\*\*/gi, '');
      reply = reply.replace(/\*\*Page\s*\d+(-\d+)?[:\s]*/gi, '');
      // Remove "Page X:" without bold
      reply = reply.replace(/^Page\s*\d+(-\d+)?[:\s]*/gim, '');
      // Remove "Here is the story" type intros
      reply = reply.replace(/^(Here is|Here's|Let me|I'll|Let's)[^.]*\.\s*/gi, '');
      // Remove ending questions and options (use [\s\S] instead of . with s flag)
      reply = reply.replace(/Would you like[^?]*\?[\s\S]*$/gi, '');
      reply = reply.replace(/Let me know[^.]*\.[\s\S]*$/gi, '');
      reply = reply.replace(/Please (respond|let me know|choose)[^.]*\.[\s\S]*$/gi, '');
      reply = reply.replace(/You can also ask me to:[\s\S]*$/gi, '');
      reply = reply.replace(/I hope you enjoyed[^.]*![\s\S]*$/gi, '');
      reply = reply.replace(/\d+\.\s*(Continue|Make changes|Create|Change|Provide|Ask)[^\n]*\n?/gi, '');
      // Remove word/page count mentions
      reply = reply.replace(/\*\*Current (word|page) count[^*]*\*\*/gi, '');
      reply = reply.replace(/Current (word|page) count[^\n]*/gi, '');
      // Remove emojis at the end
      reply = reply.replace(/📚\s*$/, '');
      reply = reply.replace(/😊\s*$/, '');
      reply = reply.replace(/🤔\s*$/, '');
      // Remove "The end" markers
      reply = reply.replace(/The end\.\s*$/gi, '');
      // Clean up extra whitespace
      reply = reply.replace(/\n{3,}/g, '\n\n').trim();
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error('Chat API error:', e);
    return NextResponse.json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}
