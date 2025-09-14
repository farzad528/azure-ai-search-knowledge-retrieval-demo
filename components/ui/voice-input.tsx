'use client'

import * as React from 'react'
import { Mic20Regular, MicOff20Regular } from '@fluentui/react-icons'
import { Button } from './button'
import { cn } from '@/lib/utils'


interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  className?: string
  disabled?: boolean
}

export function VoiceInput({ onTranscript, className, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
    }
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  const toggleListening = () => {
    if (!isSupported) {
      console.warn('Speech recognition is not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('SpeechRecognition not found')
      return
    }

    // If currently listening, stop
    if (isListening && recognitionRef.current) {
      console.log('Stopping speech recognition')
      recognitionRef.current.stop()
      return
    }

    try {
      console.log('Starting speech recognition')
      
      // Create new recognition instance
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Configure recognition
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log('Speech recognition started')
        setIsListening(true)
        
        // Set a timeout to automatically stop listening after 10 seconds
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            console.log('Voice input timeout - stopping recognition')
            recognitionRef.current.stop()
          }
        }, 10000)
      }

      recognition.onend = () => {
        console.log('Speech recognition ended')
        setIsListening(false)
        recognitionRef.current = null
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }

      recognition.onresult = (event) => {
        console.log('Speech recognition result:', event)
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript
          console.log('Transcript:', transcript)
          if (transcript && transcript.trim()) {
            onTranscript(transcript.trim())
          }
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        recognitionRef.current = null
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'no-speech':
            console.warn('No speech was detected. Please try again.')
            break
          case 'audio-capture':
            console.error('Audio capture failed. Please check your microphone.')
            break
          case 'not-allowed':
            console.error('Microphone access denied. Please allow microphone permissions.')
            break
          default:
            console.error('Speech recognition error:', event.error)
        }
      }

      // Start recognition
      recognition.start()
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setIsListening(false)
      recognitionRef.current = null
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 transition-all duration-200',
        isListening && 'text-accent bg-accent-subtle animate-pulse scale-110 border-2 border-accent',
        className
      )}
      onClick={toggleListening}
      disabled={disabled}
      aria-label={isListening ? 'Stop voice input (listening...)' : 'Start voice input'}
      title={isListening ? 'Listening... Click to stop' : 'Click to start voice input'}
    >
      {isListening ? (
        <MicOff20Regular className="h-4 w-4" />
      ) : (
        <Mic20Regular className="h-4 w-4" />
      )}
    </Button>
  )
}