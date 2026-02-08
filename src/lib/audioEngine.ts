import * as Tone from 'tone'

export interface MusicalNote {
  pitch: string
  time: number | string
  duration: string
  velocity?: number
}

export interface CompositionData {
  notes: MusicalNote[]
  bpm: number
  instruments: string[]
}

class AudioEngine {
  private synths: Map<string, Tone.PolySynth> = new Map()
  private part: Tone.Part | null = null
  private isInitialized = false

  async init() {
    if (this.isInitialized) return
    await Tone.start()
    this.isInitialized = true
  }

  private getSynth(name: string): Tone.PolySynth {
    if (this.synths.has(name)) return this.synths.get(name)!

    let synth: Tone.PolySynth
    
    switch (name.toLowerCase()) {
      case 'piano':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination()
        break
      case 'synth':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
        }).toDestination()
        break
      case 'bass':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 0.5 }
        }).toDestination()
        break
      case 'strings':
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'square' },
          envelope: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 2 }
        }).toDestination()
        break
      default:
        synth = new Tone.PolySynth().toDestination()
    }

    this.synths.set(name, synth)
    return synth
  }

  loadComposition(data: CompositionData) {
    this.stop()
    if (this.part) {
      this.part.dispose()
    }

    Tone.getTransport().bpm.value = data.bpm

    const synth = this.getSynth(data.instruments[0] || 'piano')

    this.part = new Tone.Part((time, note: MusicalNote) => {
      synth.triggerAttackRelease(note.pitch, note.duration, time, note.velocity || 0.7)
    }, data.notes)

    this.part.start(0)
  }

  async play() {
    await this.init()
    Tone.getTransport().start()
  }

  pause() {
    Tone.getTransport().pause()
  }

  stop() {
    Tone.getTransport().stop()
  }

  get transport() {
    return Tone.getTransport()
  }
}

export const audioEngine = new AudioEngine()
