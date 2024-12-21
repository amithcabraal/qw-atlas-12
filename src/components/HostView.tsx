import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, Trophy } from 'lucide-react';
import { calculateBounds } from '../lib/mapUtils';
import QuestionCard from './QuestionCard';
import PlayerList from './PlayerList';
import MapComponent from './MapComponent';
import type { MapRef } from '../types/map';

// ... (keep all interfaces the same)

export default function HostView({
  gameId,
  currentQuestion,
  players,
  answers: propAnswers,
  onNextQuestion,
  onRevealAnswers,
  question
}: HostViewProps) {
  // ... (keep all state declarations the same)

  const revealAnswersSequentially = async () => {
    if (!mapRef.current) return;

    try {
      console.log('Current question:', currentQuestion);
      console.log('All answers:', propAnswers);
      
      // Fix: Match the question_id stored in the database
      const relevantAnswers = propAnswers
        .filter(a => a.question_id === currentQuestion)
        .sort((a, b) => b.score - a.score);

      console.log('Relevant answers:', relevantAnswers);

      // First, fly to the correct location
      mapRef.current.flyTo({
        center: [question.longitude, question.latitude],
        zoom: 5,
        duration: 2000
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show correct answer marker first
      setDisplayedAnswers([{
        id: 'correct',
        player_id: 'correct',
        game_id: gameId,
        question_id: currentQuestion,
        latitude: question.latitude,
        longitude: question.longitude,
        distance: 0,
        score: 1000
      }]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show all player answers
      setDisplayedAnswers(prev => [...prev, ...relevantAnswers]);

      // Calculate bounds to show all markers
      if (relevantAnswers.length > 0) {
        const bounds = calculateBounds([
          [question.longitude, question.latitude],
          ...relevantAnswers.map(a => [a.longitude, a.latitude])
        ]);

        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 2000
        });
      }

      setRevealComplete(true);
    } catch (err) {
      console.error('Error revealing answers:', err);
      setError('Failed to reveal answers');
    }
  };

  // ... (keep the rest of the component the same)
}