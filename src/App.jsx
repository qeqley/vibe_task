import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './hooks/useSound';

// Константы игры
const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;

// Направления
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Начальная позиция змейки
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

// Генерация случайной позиции для еды
const generateFood = (snake) => {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  return newFood;
};

// Компонент настроек
const Settings = ({ wallMode, setWallMode, soundEnabled, setSoundEnabled, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-6 max-w-md w-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            ⚙️ Настройки
          </h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Звук */}
          <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-cyan-100 font-semibold mb-1">Звуковые эффекты</h3>
                <p className="text-cyan-400/70 text-sm">Звуки поедания и game over</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  soundEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Режим стен */}
          <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-cyan-100 font-semibold mb-1">Режим стен</h3>
                <p className="text-cyan-400/70 text-sm">
                  {wallMode ? 'Стены убивают' : 'Телепортация через стены'}
                </p>
              </div>
              <button
                onClick={() => setWallMode(!wallMode)}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  wallMode ? 'bg-red-500' : 'bg-purple-500'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    wallMode ? 'translate-x-0' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Информация */}
          <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
            <h3 className="text-purple-100 font-semibold mb-2">ℹ️ Подсказки</h3>
            <ul className="text-purple-300/80 text-sm space-y-1">
              <li>• Стрелки или WASD - управление</li>
              <li>• Пробел - пауза</li>
              <li>• Enter - новая игра</li>
              <li>• Собирайте яблоки и набирайте очки!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент таблицы рекордов
const Leaderboard = ({ scores, onClose }) => {
  const topScores = [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-6 max-w-md w-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            🏆 Рекорды
          </h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {topScores.length === 0 ? (
            <p className="text-center text-cyan-300/70 py-8">
              Рекордов пока нет. Сыграйте первую игру!
            </p>
          ) : (
            topScores.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700'
                    : 'bg-cyan-900/30 border border-cyan-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl font-bold ${
                      index === 0
                        ? 'text-yellow-400'
                        : index === 1
                        ? 'text-gray-300'
                        : index === 2
                        ? 'text-orange-600'
                        : 'text-cyan-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-cyan-100 font-semibold">{entry.name}</p>
                    <p className="text-cyan-400/70 text-xs">
                      {new Date(entry.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">{entry.score}</p>
                  <p className="text-xs text-cyan-400/70">очков</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Компонент частиц
const Particle = ({ x, y, delay }) => {
  return (
    <div
      className="absolute w-2 h-2 bg-pink-400 rounded-full animate-ping"
      style={{
        left: x,
        top: y,
        animationDelay: `${delay}ms`,
        animationDuration: '500ms',
      }}
    />
  );
};

// Компонент игрового поля
const GameBoard = ({ snake, food, gameOver, particles }) => {
  return (
    <div
      className="relative bg-black/50 rounded-xl border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] overflow-hidden"
      style={{
        width: GRID_SIZE * CELL_SIZE,
        height: GRID_SIZE * CELL_SIZE,
      }}
    >
      {/* Сетка */}
      <div className="absolute inset-0 grid-pattern opacity-10" />

      {/* Змейка */}
      {snake.map((segment, index) => (
        <div
          key={index}
          className={`absolute transition-all duration-100 ${
            index === 0
              ? 'bg-gradient-to-br from-cyan-400 to-purple-500 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10'
              : 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(34,211,238,0.6)]'
          } ${gameOver ? 'opacity-50' : ''}`}
          style={{
            left: segment.x * CELL_SIZE + 2,
            top: segment.y * CELL_SIZE + 2,
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            borderRadius: index === 0 ? '8px' : '6px',
          }}
        >
          {index === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
              👁️
            </div>
          )}
        </div>
      ))}

      {/* Еда */}
      <div
        className="absolute animate-pulse"
        style={{
          left: food.x * CELL_SIZE + 2,
          top: food.y * CELL_SIZE + 2,
          width: CELL_SIZE - 4,
          height: CELL_SIZE - 4,
        }}
      >
        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-500 rounded-full shadow-[0_0_20px_rgba(244,114,182,0.8)] flex items-center justify-center text-white">
          🍎
        </div>
      </div>

      {/* Частицы */}
      {particles.map((particle, index) => (
        <Particle key={index} x={particle.x} y={particle.y} delay={particle.delay} />
      ))}

      {/* Game Over оверлей */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center animate-pulse">
            <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-600 mb-2">
              GAME OVER
            </p>
            <p className="text-cyan-400 text-xl">Нажмите Enter для новой игры</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Основной компонент приложения
export default function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [nextDirection, setNextDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [isPaused, setIsPaused] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem('snakeScores');
    return saved ? JSON.parse(saved) : [];
  });
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particles, setParticles] = useState([]);
  const [wallMode, setWallMode] = useState(true); // true - стены убивают, false - телепорт
  const [showSettings, setShowSettings] = useState(false);

  const gameLoopRef = useRef(null);
  const { playEat, playGameOver } = useSound();
  
  const bestScore = scores.length > 0 
    ? Math.max(...scores.map(s => s.score))
    : 0;

  // Игровой цикл
  const gameLoop = useCallback(() => {
    if (isPaused || gameOver) return;

    setSnake((prevSnake) => {
      let newHead = {
        x: prevSnake[0].x + nextDirection.x,
        y: prevSnake[0].y + nextDirection.y,
      };

      // Проверка столкновения со стенами
      if (wallMode) {
        // Режим со стенами
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setIsPaused(true);
          setShowNameInput(true);
          if (soundEnabled) playGameOver();
          return prevSnake;
        }
      } else {
        // Режим с телепортацией
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      // Проверка столкновения с собой
      if (
        prevSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        setIsPaused(true);
        setShowNameInput(true);
        if (soundEnabled) playGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Проверка поедания еды
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setSpeed((s) => Math.max(50, s - SPEED_INCREMENT));
        
        // Создание частиц
        const newParticles = [];
        const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8;
          newParticles.push({
            x: centerX + Math.cos(angle) * 10,
            y: centerY + Math.sin(angle) * 10,
            delay: i * 50,
          });
        }
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 500);
        
        setFood(generateFood(newSnake));
        if (soundEnabled) playEat();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });

    setDirection(nextDirection);
  }, [nextDirection, isPaused, gameOver, food, soundEnabled, playEat, playGameOver, wallMode]);

  // Эффект для игрового цикла
  useEffect(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    if (!isPaused && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, speed);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, speed, isPaused, gameOver]);

  // Обработка клавиш
  useEffect(() => {
    const handleKeyPress = (e) => {
      e.preventDefault();

      if (e.key === 'Enter') {
        if (gameOver) {
          resetGame();
        } else {
          setIsPaused((p) => !p);
        }
        return;
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setNextDirection(DIRECTIONS.UP);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setNextDirection(DIRECTIONS.DOWN);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setNextDirection(DIRECTIONS.LEFT);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setNextDirection(DIRECTIONS.RIGHT);
          break;
        case ' ':
          setIsPaused((p) => !p);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused, gameOver]);

  // Сброс игры
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(DIRECTIONS.RIGHT);
    setNextDirection(DIRECTIONS.RIGHT);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setIsPaused(true);
    setShowNameInput(false);
  };

  // Сохранение рекорда
  const saveScore = () => {
    if (!playerName.trim()) return;

    const newScore = {
      name: playerName.trim(),
      score: score,
      date: new Date().toISOString(),
    };

    const updatedScores = [...scores, newScore];
    setScores(updatedScores);
    localStorage.setItem('snakeScores', JSON.stringify(updatedScores));
    setShowNameInput(false);
    setPlayerName('');
  };

  // Управление на мобильных устройствах
  const handleMobileControl = (dir) => {
    if (isPaused || gameOver) return;

    if (dir === 'UP' && direction.y === 0) setNextDirection(DIRECTIONS.UP);
    else if (dir === 'DOWN' && direction.y === 0) setNextDirection(DIRECTIONS.DOWN);
    else if (dir === 'LEFT' && direction.x === 0) setNextDirection(DIRECTIONS.LEFT);
    else if (dir === 'RIGHT' && direction.x === 0) setNextDirection(DIRECTIONS.RIGHT);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex flex-col items-center justify-center p-4">
      {/* Заголовок */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-5xl md:text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
          🐍 NEON SNAKE
        </h1>
        <p className="text-cyan-300/70 text-sm md:text-base">
          Используйте стрелки или WASD для управления
        </p>
      </div>

      {/* Панель статистики */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <div className="bg-black/50 border-2 border-cyan-400 rounded-lg px-6 py-3 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
          <p className="text-cyan-400/70 text-xs mb-1">СЧЁТ</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {score}
          </p>
        </div>

        <div className="bg-black/50 border-2 border-yellow-400 rounded-lg px-6 py-3 shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          <p className="text-yellow-400/70 text-xs mb-1">🏆 РЕКОРД</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            {bestScore}
          </p>
        </div>

        <div className="bg-black/50 border-2 border-purple-400 rounded-lg px-6 py-3 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
          <p className="text-purple-400/70 text-xs mb-1">ДЛИНА</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            {snake.length}
          </p>
        </div>

        <div className="bg-black/50 border-2 border-pink-400 rounded-lg px-6 py-3 shadow-[0_0_20px_rgba(244,114,182,0.5)]">
          <p className="text-pink-400/70 text-xs mb-1">СКОРОСТЬ</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">
            {Math.round((1000 / speed) * 10) / 10}x
          </p>
        </div>
      </div>

      {/* Индикатор режима */}
      <div className="mb-2 flex justify-center gap-3">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          wallMode 
            ? 'bg-red-500/20 border border-red-400 text-red-300'
            : 'bg-purple-500/20 border border-purple-400 text-purple-300'
        }`}>
          {wallMode ? '🧱 Режим стен' : '🌀 Режим телепорта'}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          soundEnabled
            ? 'bg-green-500/20 border border-green-400 text-green-300'
            : 'bg-gray-500/20 border border-gray-400 text-gray-300'
        }`}>
          {soundEnabled ? '🔊 Звук вкл' : '🔇 Звук выкл'}
        </div>
      </div>

      {/* Игровое поле */}
      <div className="mb-6">
        <GameBoard snake={snake} food={food} gameOver={gameOver} particles={particles} />
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-4 mb-6 flex-wrap justify-center">
        <button
          onClick={() => setIsPaused(!isPaused)}
          disabled={gameOver}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPaused ? '▶️ СТАРТ' : '⏸️ ПАУЗА'}
        </button>

        <button
          onClick={resetGame}
          className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-400 hover:to-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(244,114,182,0.5)] transition-all hover:shadow-[0_0_30px_rgba(244,114,182,0.8)]"
        >
          🔄 НОВАЯ ИГРА
        </button>

        <button
          onClick={() => setShowLeaderboard(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.8)]"
        >
          🏆 РЕКОРДЫ
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]"
        >
          ⚙️ НАСТРОЙКИ
        </button>
      </div>

      {/* Мобильное управление */}
      <div className="grid grid-cols-3 gap-2 md:hidden max-w-xs mx-auto mb-6">
        <div></div>
        <button
          onClick={() => handleMobileControl('UP')}
          className="bg-cyan-500/30 border-2 border-cyan-400 rounded-lg p-4 active:bg-cyan-500/50"
        >
          <svg className="w-8 h-8 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div></div>
        
        <button
          onClick={() => handleMobileControl('LEFT')}
          className="bg-cyan-500/30 border-2 border-cyan-400 rounded-lg p-4 active:bg-cyan-500/50"
        >
          <svg className="w-8 h-8 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div></div>
        <button
          onClick={() => handleMobileControl('RIGHT')}
          className="bg-cyan-500/30 border-2 border-cyan-400 rounded-lg p-4 active:bg-cyan-500/50"
        >
          <svg className="w-8 h-8 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div></div>
        <button
          onClick={() => handleMobileControl('DOWN')}
          className="bg-cyan-500/30 border-2 border-cyan-400 rounded-lg p-4 active:bg-cyan-500/50"
        >
          <svg className="w-8 h-8 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div></div>
      </div>

      {/* Подсказки */}
      <div className="text-center space-y-2">
        <div className="flex flex-wrap justify-center gap-4 text-cyan-300/70 text-xs">
          <span>⌨️ Стрелки / WASD - движение</span>
          <span>␣ Пробел - пауза</span>
          <span>↵ Enter - новая игра</span>
        </div>
      </div>

      {/* Настройки */}
      {showSettings && (
        <Settings
          wallMode={wallMode}
          setWallMode={setWallMode}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Таблица рекордов */}
      {showLeaderboard && (
        <Leaderboard scores={scores} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Модальное окно ввода имени */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-md w-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)] animate-fadeIn">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 text-center">
              Новый рекорд! 🎉
            </h2>
            <p className="text-cyan-300 text-center mb-6">
              Ваш счёт: <span className="text-4xl font-bold text-pink-400">{score}</span>
            </p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveScore()}
              placeholder="Введите ваше имя"
              maxLength={20}
              className="w-full bg-black/50 border-2 border-cyan-400 rounded-lg px-4 py-3 text-cyan-100 placeholder-cyan-400/50 focus:outline-none focus:border-purple-400 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={saveScore}
                disabled={!playerName.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-bold shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                💾 Сохранить
              </button>
              <button
                onClick={() => setShowNameInput(false)}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Пропустить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
