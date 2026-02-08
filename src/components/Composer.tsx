import React, { useState } from 'react'
import { Sparkles, Play, Pause, Download, Save, RotateCcw, Mic, Music2, Settings2, Volume2, Key, Timer } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Badge } from './ui/badge'
import { generateComposition, AICompositionResult } from '../lib/ai'
import { audioEngine } from '../lib/audioEngine'
import { blink } from '../lib/blink'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

export function Composer() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [result, setResult] = useState<AICompositionResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Advanced Options
  const [genre, setGenre] = useState('pop')
  const [mood, setMood] = useState('happy')
  const [tempo, setTempo] = useState(120)
  const [musicalKey, setMusicalKey] = useState('C Major')
  const [instrument, setInstrument] = useState('piano')
  const [includeVocals, setIncludeVocals] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt for your music')
      return
    }

    setIsGenerating(true)
    try {
      const data = await generateComposition(prompt, {
        genre,
        mood,
        tempo,
        key: musicalKey,
        instruments: [instrument],
        includeVocals
      })
      setResult(data)
      audioEngine.loadComposition(data.composition)
      toast.success('Music composed successfully!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate music. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = async () => {
    if (!result) return

    if (isPlaying) {
      audioEngine.pause()
    } else {
      await audioEngine.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSave = async () => {
    if (!result || isSaving) return
    setIsSaving(true)
    
    try {
      const user = await blink.auth.me()
      if (!user) {
        toast.error('Please login to save your compositions')
        return
      }

      await blink.db.compositions.create({
        id: crypto.randomUUID(),
        userId: user.id,
        title: result.title,
        summary: result.summary,
        genre,
        mood,
        tempo,
        musicalKey,
        lyrics: result.lyrics,
        musicalData: JSON.stringify(result.composition),
        albumArt: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(result.title)}&backgroundColor=0d9488,14b8a6,8b5cf6`,
      })
      toast.success('Composition saved to your library!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to save composition')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadJson = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result.composition, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.title.replace(/\s+/g, '_')}_composition.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-fade-in">
      {!result ? (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              What does your <span className="text-primary italic">masterpiece</span> sound like?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Describe a mood, a scene, or a feeling. Our Gemini AI will compose original music and lyrics just for you.
            </p>
          </div>

          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <Label htmlFor="prompt" className="text-lg font-medium">Your Musical Idea</Label>
                <div className="relative group">
                  <Textarea
                    id="prompt"
                    placeholder="e.g. A melancholic piano melody for a rainy afternoon in Paris..."
                    className="min-h-[120px] text-lg bg-background/50 border-primary/20 focus:border-primary transition-all resize-none pr-12"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute bottom-3 right-3 text-muted-foreground hover:text-primary"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={cn("gap-2", showAdvanced && "bg-muted border-primary")}
                >
                  <Settings2 className="w-4 h-4" />
                  Advanced Options
                </Button>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                  <Badge variant="outline" className="text-xs uppercase tracking-widest border-primary/20 text-primary">Royalty Free</Badge>
                  <Badge variant="outline" className="text-xs uppercase tracking-widest border-accent/20 text-accent">Studio Quality</Badge>
                </div>
              </div>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 rounded-xl bg-muted/30 border border-primary/10 animate-slide-up">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Music2 className="w-4 h-4" /> Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="bg-background/50 border-primary/10">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="lofi">Lo-Fi</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="ambient">Ambient</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Volume2 className="w-4 h-4" /> Mood</Label>
                    <Select value={mood} onValueChange={setMood}>
                      <SelectTrigger className="bg-background/50 border-primary/10">
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="sad">Sad</SelectItem>
                        <SelectItem value="energetic">Energetic</SelectItem>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="mysterious">Mysterious</SelectItem>
                        <SelectItem value="epic">Epic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Key className="w-4 h-4" /> Musical Key</Label>
                    <Select value={musicalKey} onValueChange={setMusicalKey}>
                      <SelectTrigger className="bg-background/50 border-primary/10">
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C Major">C Major</SelectItem>
                        <SelectItem value="G Major">G Major</SelectItem>
                        <SelectItem value="D Major">D Major</SelectItem>
                        <SelectItem value="A Minor">A Minor</SelectItem>
                        <SelectItem value="E Minor">E Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><Timer className="w-4 h-4" /> Tempo (BPM): {tempo}</Label>
                    <Slider 
                      value={[tempo]} 
                      onValueChange={([v]) => setTempo(v)} 
                      min={60} 
                      max={200} 
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">Instrument</Label>
                    <Select value={instrument} onValueChange={setInstrument}>
                      <SelectTrigger className="bg-background/50 border-primary/10">
                        <SelectValue placeholder="Select instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piano">Grand Piano</SelectItem>
                        <SelectItem value="synth">Poly Synth</SelectItem>
                        <SelectItem value="strings">Orchestral Strings</SelectItem>
                        <SelectItem value="bass">Deep Bass</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                     <input 
                      type="checkbox" 
                      id="vocals" 
                      checked={includeVocals}
                      onChange={(e) => setIncludeVocals(e.target.checked)}
                      className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary bg-background/50"
                     />
                     <Label htmlFor="vocals">Generate Lyrics & Vocals</Label>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full h-14 text-lg font-bold gap-3 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all group"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Composing Masterpiece...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 group-hover:scale-125 transition-transform" />
                    Generate Music
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-xl">
              <div className="aspect-[2/1] relative bg-gradient-to-br from-primary/20 via-background to-accent/10 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(result.title)}&backgroundColor=0d9488,14b8a6,8b5cf6`} 
                  alt="Album Art"
                  className="w-48 h-48 rounded-2xl shadow-2xl relative z-10 animate-pulse-gentle"
                />
                <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
                  <div className="w-full h-1/2 flex items-end justify-around px-8">
                    {[...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 bg-primary rounded-full transition-all duration-300",
                          isPlaying ? "animate-bounce" : "h-4"
                        )}
                        style={{ 
                          height: isPlaying ? `${Math.random() * 80 + 20}%` : '10px',
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: '0.8s'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">{result.title}</h2>
                    <p className="text-muted-foreground">{result.summary}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setResult(null)}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={downloadJson}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="primary" 
                      className="gap-2" 
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save to Library'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{genre}</Badge>
                  <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">{mood}</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">{tempo} BPM</Badge>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">{musicalKey}</Badge>
                </div>

                <div className="pt-4 flex items-center gap-6">
                  <Button 
                    size="icon" 
                    className="w-16 h-16 rounded-full shadow-lg"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </Button>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full bg-primary transition-all duration-300",
                          isPlaying ? "w-1/3" : "w-0"
                        )} 
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0:00</span>
                      <span>1:00</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {result.lyrics && (
              <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Lyrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-muted-foreground italic">
                    {result.lyrics}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg">Orchestration</CardTitle>
                <CardDescription>Composition Breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lead Instrument</span>
                    <span className="font-medium capitalize">{instrument}</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className="h-full bg-primary w-[80%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Note Density</span>
                    <span className="font-medium">High</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className="h-full bg-accent w-[65%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Complexity</span>
                    <span className="font-medium">Melodic</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full">
                    <div className="h-full bg-primary w-[45%]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <p className="text-sm text-primary/80 leading-relaxed">
                  <strong>Pro Tip:</strong> You can download the <code>composition.json</code> file and import it into professional DAWs like Ableton Live, FL Studio, or Logic Pro to further refine the AI's composition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
