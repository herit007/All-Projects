import { blink } from './blink'
import { CompositionData } from './audioEngine'

export interface AICompositionResult {
  title: string
  summary: string
  lyrics: string
  composition: CompositionData
}

export async function generateComposition(
  prompt: string,
  options: {
    genre?: string
    mood?: string
    tempo?: number
    key?: string
    instruments?: string[]
    includeVocals?: boolean
  }
): Promise<AICompositionResult> {
  const systemPrompt = `You are an expert AI Music Composer. 
Your task is to transform user prompts into a structured musical composition.

User's direction: ${prompt}
Musical context:
- Genre: ${options.genre || 'Any'}
- Mood: ${options.mood || 'Any'}
- Tempo: ${options.tempo || '120'} BPM
- Key: ${options.key || 'C Major'}
- Instruments: ${(options.instruments || ['piano']).join(', ')}

You must generate:
1. A creative title for the piece.
2. A brief 1-2 sentence summary of the musical style and mood.
3. Original lyrics (if vocals are requested).
4. A machine-readable musical score in JSON format.

The musical score must follow this structure:
{
  "notes": [
    { "pitch": "C4", "time": 0, "duration": "4n", "velocity": 0.8 }
  ],
  "bpm": ${options.tempo || 120},
  "instruments": ["${(options.instruments || ['piano'])[0]}"]
}

Pitch should be scientific pitch notation (e.g., C4, D#3).
Time should be in seconds (number) or Tone.js time strings (e.g., "0:0:1").
Duration should be Tone.js duration strings (e.g., "4n", "8n", "2n", "1m").
Ensure the composition is musical, coherent, and at least 30-60 seconds long (at least 32-64 notes).`

  const { object } = await blink.ai.generateObject({
    prompt: `Generate a musical composition based on: ${prompt}. ${options.includeVocals ? 'Include lyrics.' : 'No lyrics needed.'}`,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        lyrics: { type: 'string' },
        composition: {
          type: 'object',
          properties: {
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pitch: { type: 'string' },
                  time: { type: 'number' },
                  duration: { type: 'string' },
                  velocity: { type: 'number' }
                },
                required: ['pitch', 'time', 'duration']
              }
            },
            bpm: { type: 'number' },
            instruments: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['notes', 'bpm', 'instruments']
        }
      },
      required: ['title', 'summary', 'composition']
    },
    systemPrompt
  })

  return object as AICompositionResult
}
