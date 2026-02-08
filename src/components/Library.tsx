import React, { useState, useEffect } from 'react'
import { Play, Trash2, Calendar, Music, Clock, Key, Info } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { blink } from '../lib/blink'
import { audioEngine, CompositionData } from '../lib/audioEngine'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'
import { cn } from '../lib/utils'

interface Composition {
  id: string
  title: string
  summary: string
  genre: string
  mood: string
  tempo: number
  musicalKey: string
  lyrics: string
  musicalData: string
  albumArt: string
  createdAt: string
}

export function Library() {
  const { user } = useAuth()
  const [compositions, setCompositions] = useState<Composition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCompositions()
  }, [user])

  const fetchCompositions = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await blink.db.compositions.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      setCompositions(data as unknown as Composition[])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load your library')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = async (comp: Composition) => {
    if (playingId === comp.id) {
      audioEngine.pause()
      setPlayingId(null)
    } else {
      const musicalData = JSON.parse(comp.musicalData) as CompositionData
      audioEngine.loadComposition(musicalData)
      await audioEngine.play()
      setPlayingId(comp.id)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this composition?')) return
    
    try {
      await blink.db.compositions.delete(id)
      setCompositions(prev => prev.filter(c => c.id !== id))
      toast.success('Composition deleted')
      if (playingId === id) {
        audioEngine.stop()
        setPlayingId(null)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete composition')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading your musical journey...</p>
      </div>
    )
  }

  if (compositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Music className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-2">No compositions yet</h3>
        <p className="text-muted-foreground max-w-md mb-8">
          Start your creative journey by describing your first masterpiece in the Composer.
        </p>
        <Button onClick={() => window.location.reload()}>
          Go to Composer
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {compositions.map((comp) => (
          <Card key={comp.id} className="group overflow-hidden border-primary/10 hover:border-primary/30 transition-all bg-card/50 backdrop-blur-md hover:shadow-2xl hover:shadow-primary/5">
            <div className="aspect-square relative overflow-hidden bg-muted">
              <img 
                src={comp.albumArt} 
                alt={comp.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button 
                  size="icon" 
                  variant="primary" 
                  className="w-16 h-16 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300"
                  onClick={() => togglePlayback(comp)}
                >
                  <Play className={cn("w-8 h-8 fill-current ml-1", playingId === comp.id && "animate-pulse")} />
                </Button>
              </div>
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-black/60 backdrop-blur-md border-white/10 uppercase tracking-tighter text-[10px]">
                  {comp.genre}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-lg truncate">{comp.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{comp.summary}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleDelete(comp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{comp.tempo} BPM</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-3 h-3" />
                  <span>{comp.musicalKey}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(comp.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span className="capitalize">{comp.mood}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
