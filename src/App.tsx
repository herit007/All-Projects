import React, { useState } from 'react'
import { Layout } from './components/Layout'
import { Composer } from './components/Composer'
import { Library } from './components/Library'
import { Toaster } from './components/ui/sonner'
import { useAuth } from './hooks/useAuth'
import { Button } from './components/ui/button'
import { Music, Sparkles } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState<'composer' | 'library'>('composer')
  const { isAuthenticated, isLoading, login } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Initializing audio engines...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center space-y-8 overflow-hidden relative">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full z-0" />
        
        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 mb-4 animate-bounce-slow">
            <Music className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-text bg-clip-text text-transparent">
            Gemini Composer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
            The future of music creation is here. <br />
            Transform your thoughts into studio-quality symphonies with AI.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold gap-2 shadow-xl shadow-primary/20" onClick={login}>
              Get Started for Free
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold">
              Explore Library
            </Button>
          </div>
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <h3 className="font-bold text-primary">AI Score Engine</h3>
              <p className="text-sm text-muted-foreground">Advanced algorithms generating real musical notes and notation.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-accent">Real-time Synthesis</h3>
              <p className="text-sm text-muted-foreground">High-fidelity browser-based audio synthesis using Tone.js.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-primary">Royalty Free</h3>
              <p className="text-sm text-muted-foreground">Own your creations completely. Commercial rights included for free.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'composer' ? <Composer /> : <Library />}
      <Toaster position="bottom-right" theme="dark" richColors />
    </Layout>
  )
}

export default App
