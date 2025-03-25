'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { CardSelector } from '@/components/CardSelector';
import {
  calculateMultiplayerEquity,
  type Card as CardType,
  type GameType,
  HOLE_CARDS_COUNT
} from '@/utils/poker';

const MAX_PLAYERS = 6;

export default function Home() {
  const [hands, setHands] = useState<CardType[][]>(Array(2).fill([]));
  const [board, setBoard] = useState<CardType[]>([]);
  const [equity, setEquity] = useState<{
    equities: number[];
    ties: number[];
  } | null>(null);
  const [activeSelector, setActiveSelector] = useState<number | 'board'>(0);
  const [gameType, setGameType] = useState<GameType>('texas-holdem');
  const [isCalculating, setIsCalculating] = useState(false);

  const allCards = [...hands.flat(), ...board];
  const holeCardsNeeded = HOLE_CARDS_COUNT[gameType];

  // Automatically advance to next player or board
  const advanceSelector = () => {
    if (activeSelector === 'board') {
      if (board.length < 5) {
        return;
      }
      // Set back to first player instead of null
      setActiveSelector(0);
    } else if (typeof activeSelector === 'number') {
      if (hands[activeSelector].length < holeCardsNeeded) {
        return;
      }
      if (activeSelector < hands.length - 1) {
        setActiveSelector(activeSelector + 1);
      } else if (board.length < 5) {
        setActiveSelector('board');
      } else {
        // Set back to first player instead of null
        setActiveSelector(0);
      }
    }
  };

  // Check if we should advance after each card selection
  useEffect(() => {
    advanceSelector();
  }, [hands, board]);

  const handleCardSelect = (card: CardType) => {
    // No need to check for null as we changed the type
    if (activeSelector === 'board') {
      if (board.length < 5) {
        setBoard([...board, card]);
      }
    } else {
      if (hands[activeSelector].length < holeCardsNeeded) {
        const newHands = [...hands];
        newHands[activeSelector] = [...hands[activeSelector], card];
        setHands(newHands);
      }
    }
  };

  const calculateResults = () => {
    if (hands.every(hand => hand.length === holeCardsNeeded)) {
      setIsCalculating(true);

      // Use setTimeout to allow the UI to update before starting the calculation
      setTimeout(() => {
        try {
          const result = calculateMultiplayerEquity(hands, board, gameType);
          setEquity(result);
        } catch (error) {
          console.error('Error calculating equity:', error);
          alert('There was an error calculating equity. Please try again.');
        } finally {
          setIsCalculating(false);
        }
      }, 100);
    }
  };

  const reset = () => {
    setHands(Array(hands.length).fill([]));
    setBoard([]);
    setEquity(null);
    setActiveSelector(0);
  };

  const addPlayer = () => {
    if (hands.length < MAX_PLAYERS) {
      setHands([...hands, []]);
      setEquity(null);
    }
  };

  const removePlayer = () => {
    if (hands.length > 2) {
      setHands(hands.slice(0, -1));
      setEquity(null);

      if (typeof activeSelector === 'number' && activeSelector >= hands.length - 1) {
        setActiveSelector(hands.length - 2);
      }
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="text-center text-xs text-gray-500 mb-1">
        Made with ❤️ by <a href="https://twitter.com/nomorebear" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Swit</a> & <a href="https://twitter.com/PNattapatsiri" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Paul</a> from <a href="https://orge.xyz/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Orge Labs</a>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 pt-3 text-center">
        Poker Equity Calculator
        <span className="inline-block ml-2 text-amber-500 cursor-help relative group text-sm align-text-top">
          ⓘ
          <span className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 w-72 p-2 bg-gray-800 text-white text-xs leading-tight rounded shadow-lg z-10 mt-1">
            For optimal mobile performance, this calculator uses a Monte Carlo simulation with random runouts. While this provides a close approximation rather than exact equity, it ensures fast calculations across all devices.
          </span>
        </span>
      </h1>

      <div className="max-w-6xl mx-auto">
        {/* Game controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label className="font-medium">Game Type:</label>
            <select
              value={gameType}
              onChange={(e) => {
                setGameType(e.target.value as GameType);
                reset();
              }}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="texas-holdem">Texas Hold'em</option>
              <option value="super-holdem">Super Hold'em (3 cards)</option>
              <option value="omaha-holdem">Omaha Hold'em</option>
              {/* <option value="short-deck">Short Deck (6+ Hold'em)</option> */}
            </select>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={addPlayer}
              disabled={hands.length >= MAX_PLAYERS}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Add Player
            </button>
            <button
              onClick={removePlayer}
              disabled={hands.length <= 2}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Remove Player
            </button>
          </div>
        </div>

        {/* Players section - now first */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {hands.map((hand, index) => (
            <div
              key={index}
              onClick={() => setActiveSelector(index)}
              className={`space-y-3 p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50 ${
                activeSelector === index ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white shadow'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Player {index + 1}</h2>
                {equity && (
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-medium">
                      Win: {(equity.equities[index] * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Tie: {(equity.ties[index] * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: holeCardsNeeded }).map((_, i) => (
                    <div key={i} className="w-10 h-14 sm:w-12 sm:h-16">
                      <Card key={i} card={hand[i]} />
                    </div>
                  ))}
                </div>
                {hand.length > 0 && (
                  <button
                    className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 self-center ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newHands = [...hands];
                      newHands[index] = [];
                      setHands(newHands);
                      setEquity(null);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Board section - moved to below players */}
        <div
          onClick={() => setActiveSelector('board')}
          className={`mb-6 space-y-3 p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50 ${
            activeSelector === 'board' ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white shadow'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold">Board</h2>
            {board.length > 0 && (
              <button
                className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setBoard([]);
                  setEquity(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-14 sm:w-12 sm:h-16">
                <Card key={i} card={board[i]} />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={calculateResults}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50"
            disabled={!hands.every(hand => hand.length === holeCardsNeeded) || isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Equity'}
          </button>
          <button
            onClick={reset}
            className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white rounded-lg font-semibold"
            disabled={isCalculating}
          >
            Reset
          </button>
        </div>

        {/* Card selector */}
        <div className="mt-6 bg-white shadow rounded-lg overflow-x-auto">
          <CardSelector
            onSelect={handleCardSelect}
            selectedCards={[
              ...board,
              ...hands.flatMap((hand) => hand),
            ].filter(Boolean)}
            disabledCards={[
              ...board.filter(Boolean),
              ...hands.flatMap((hand) => hand.filter(Boolean)),
            ]}
            gameType={gameType}
          />
        </div>

        {/* Loading overlay */}
        {isCalculating && (
          <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium">Calculating equity...</p>
              <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
