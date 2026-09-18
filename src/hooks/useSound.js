import { useRef, useCallback } from 'react';

// Создание простых звуков с использованием Web Audio API
const createSound = (frequency, duration, type = 'sine', volume = 0.3) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    
    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + duration
    );
    oscillator.stop(audioContext.currentTime + duration);
  };
};

// Звук поедания яблока
const createEatSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  return () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'square';
    gainNode.gain.value = 0.3;
    
    oscillator.start(audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      1200,
      audioContext.currentTime + 0.1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.15
    );
    oscillator.stop(audioContext.currentTime + 0.15);
  };
};

// Звук Game Over
const createGameOverSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  return () => {
    // Первая нота
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 400;
    osc1.type = 'sawtooth';
    gain1.gain.value = 0.3;
    
    osc1.start(audioContext.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(
      200,
      audioContext.currentTime + 0.3
    );
    gain1.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );
    osc1.stop(audioContext.currentTime + 0.5);
    
    // Вторая нота
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 300;
    osc2.type = 'sawtooth';
    gain2.gain.value = 0.3;
    
    osc2.start(audioContext.currentTime + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(
      100,
      audioContext.currentTime + 0.5
    );
    gain2.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.7
    );
    osc2.stop(audioContext.currentTime + 0.7);
  };
};

export const useSound = () => {
  const soundsRef = useRef({
    eat: createEatSound(),
    gameOver: createGameOverSound(),
  });

  const playEat = useCallback(() => {
    try {
      soundsRef.current.eat();
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, []);

  const playGameOver = useCallback(() => {
    try {
      soundsRef.current.gameOver();
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, []);

  return {
    playEat,
    playGameOver,
  };
};
