'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Video, Sparkles, Languages, LogIn, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('ko');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('credits').eq('id', userId).single();
    if (data) setCredits(data.credits);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleGenerate = async () => {
    if (!user) return handleLogin();
    if (credits <= 0) return alert('크레딧이 부족합니다. Pro 플랜을 구독해주세요!');
    
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language, userId: user.id }),
      });
      
      const data = await response.json();
      if (data.url) {
        setResult(data.url);
        fetchCredits(user.id); // 차감 후 크레딧 갱신
      } else {
        alert('오류: ' + data.error);
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscription = async () => {
    if (!user) return handleLogin();
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ userId: user.id }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center p-6 selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Header */}
      <header className="z-20 w-full max-w-5xl flex justify-between items-center py-6 mb-12">
        <div className="text-2xl font-black tracking-tighter italic">ShortGen</div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                {credits} Credits
              </div>
              <button onClick={handleSubscription} className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full transition-colors">
                Pro 구독
              </button>
            </>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition-colors">
              <LogIn className="w-4 h-4" /> 시작하기
            </button>
          )}
        </div>
      </header>

      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8 pt-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            단 한 번의 클릭으로 <br/>
            <span className="text-indigo-400">쇼츠 완성</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-lg mt-4 leading-relaxed">
            주제만 입력하세요. 대본부터 영상까지 AI가 제작합니다.
          </p>
        </div>

        <div className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
          <div className="flex flex-col gap-6">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 스토아학파의 3가지 핵심 명언..."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Languages className="w-4 h-4" /> 언어 설정
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-md focus:outline-none appearance-none cursor-pointer"
              >
                <option value="ko">한국어 (Korean)</option>
                <option value="en">영어 (English)</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl py-4 font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              {user ? '60초 쇼츠 생성하기 (1 크레딧)' : '로그인 후 생성하기'}
            </button>
          </div>
        </div>

        {result && (
          <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full max-w-[300px] aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
              <video src={result} controls className="w-full h-full object-cover" autoPlay />
            </div>
            <a href={result} download className="w-full max-w-[300px] py-3 bg-white text-black text-center font-bold rounded-xl hover:bg-zinc-200 transition-colors">
              영상 다운로드
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
