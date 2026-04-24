'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

interface VoiceSearchProps {
  onResult: (text: string) => void;
  className?: string;
  lang?: string; // Add lang prop
}

export function VoiceSearch({ onResult, className, lang = 'cs-CZ' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const isSupported =
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const getRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
      return recognitionRef.current;
    }
    if (typeof window === 'undefined') return null;

    const w = window as SpeechRecognitionWindow;
    const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);

      if (event.results[current].isFinal) {
        onResult(transcriptText);
        setIsOpen(false);
        setIsListening(false);
      }
    };

    rec.onerror = (event) => {
      setError(`Chyba: ${event.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return rec;
  }, [lang, onResult]);

  const startListening = useCallback(() => {
    const rec = getRecognition();
    if (!rec) {
      alert('Hlasové vyhledávání není ve vašem prohlížeči podporováno.');
      return;
    }

    setTranscript('');
    setIsOpen(true);
    rec.start();
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  if (!isSupported) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={startListening}
        className={cn("text-zinc-400 hover:text-white transition-colors", className)}
        title={`Hlasové vyhledávání (${lang === 'cs-CZ' ? 'v češtině' : lang})`}
      >
        <Mic className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) stopListening();
        setIsOpen(open);
      }}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mic className={cn("h-5 w-5", isListening && "text-red-500 animate-pulse")} />
              Hlasové vyhledávání
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Mluvte nyní ({lang === 'cs-CZ' ? 'v češtině' : `jazyk: ${lang}`})...
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 bg-red-600/20 rounded-full blur-2xl transition-all duration-500",
                isListening ? "scale-150 opacity-100" : "scale-100 opacity-0"
              )} />
              <div className={cn(
                "relative h-24 w-24 rounded-full border-2 border-red-600 flex items-center justify-center transition-all",
                isListening ? "bg-red-600 scale-110" : "bg-zinc-900 scale-100"
              )}>
                {isListening ? (
                  <Mic className="h-10 w-10 text-white animate-bounce" />
                ) : (
                  <MicOff className="h-10 w-10 text-zinc-500" />
                )}
              </div>
            </div>

            <div className="text-center min-h-[2rem]">
              {transcript ? (
                <p className="text-lg font-medium text-white italic">„{transcript}“</p>
              ) : (
                <p className="text-zinc-500">Naslouchám...</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                {error}
              </p>
            )}

            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full"
            >
              Zrušit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
