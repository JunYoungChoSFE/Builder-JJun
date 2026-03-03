import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { topic, language, userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    // 1. Credit Check
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (!profile || profile.credits <= 0) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    // 2. GPT: Script & Keywords
    const prompt = `Write a 60-second YouTube Shorts script about: "${topic}". 
Break it into 4 scenes. Provide 1 descriptive English keyword for Pexels search per scene.
Spoken language: ${language === 'ko' ? 'Korean' : 'English'}.
Return JSON: [{ "text": "...", "video_keyword": "..." }, ...]`;

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const scriptData = JSON.parse(gptResponse.choices[0].message.content || '[]').scenes || JSON.parse(gptResponse.choices[0].message.content || '[]');
    const fullScript = scriptData.map((s: any) => s.text).join(' ');

    // 3. ElevenLabs: Voice generation
    const voiceRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullScript, model_id: 'eleven_multilingual_v2' }),
    });
    // In production, upload this buffer to Supabase Storage and get a public URL
    const audioUrl = "https://example.com/audio.mp3"; 

    // 4. Pexels: Fetch Videos
    const videoUrls = await Promise.all(scriptData.map(async (scene: any) => {
      const res = await fetch(`https://api.pexels.com/videos/search?query=${scene.video_keyword}&orientation=portrait&per_page=1`, {
        headers: { Authorization: process.env.PEXELS_API_KEY! }
      });
      const data = await res.json();
      return data.videos?.[0]?.video_files?.find((f: any) => f.quality === 'hd')?.link || data.videos?.[0]?.video_files?.[0]?.link;
    }));

    // 5. Creatomate: Final Rendering
    const creatomateRes = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.CREATOMATE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: process.env.CREATOMATE_TEMPLATE_ID,
        modifications: {
          'Audio-1': audioUrl,
          'Video-1': videoUrls[0],
          'Video-2': videoUrls[1],
          'Video-3': videoUrls[2],
          'Video-4': videoUrls[3],
        }
      })
    });
    const render = await creatomateRes.json();

    // 6. Deduct Credit
    await supabase.rpc('deduct_credit', { user_id: userId });

    return NextResponse.json({ 
      success: true, 
      url: render[0]?.url || 'https://creatomate-static.s3.amazonaws.com/demo/tiktok-style-captions.mp4' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
