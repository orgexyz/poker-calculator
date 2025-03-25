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
  const [hands, setHands] = useState<(CardType | undefined)[][]>(Array(2).fill([]));
  const [board, setBoard] = useState<(CardType | undefined)[]>([]);
  const [equity, setEquity] = useState<{
    equities: number[];
    ties: number[];
  } | null>(null);
  const [activeSelector, setActiveSelector] = useState<number | 'board'>(0);
  const [gameType, setGameType] = useState<GameType>('texas-holdem');
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Remove or comment out the unused allCards variable
  // const allCards = [...hands.flat(), ...board];
  const holeCardsNeeded = HOLE_CARDS_COUNT[gameType];

  // Automatically advance to next player or board
  const advanceSelector = () => {
    // Count only defined cards (not undefined)
    const definedCardCounts = hands.map(hand => hand.filter(c => c !== undefined).length);
    const definedBoardCount = board.filter(c => c !== undefined).length;

    // Check if all players have full hands and the board is complete
    const allCardsSelected = definedCardCounts.every(count => count === holeCardsNeeded) && definedBoardCount === 5;

    // Don't advance the selector if all cards are selected
    if (allCardsSelected) {
      return;
    }

    if (activeSelector === 'board') {
      if (definedBoardCount < 5) {
        return;
      }
      // Set back to first player instead of null
      setActiveSelector(0);
    } else if (typeof activeSelector === 'number') {
      if (definedCardCounts[activeSelector] < holeCardsNeeded) {
        return;
      }
      if (activeSelector < hands.length - 1) {
        setActiveSelector(activeSelector + 1);
      } else if (definedBoardCount < 5) {
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
  }, [hands, board, advanceSelector]);

  const handleCardSelect = (card: CardType) => {
    // No need to check for null as we changed the type
    if (activeSelector === 'board') {
      if (board.filter(c => c !== undefined).length < 5) {
        // Find the first empty slot (undefined value) or append to the end
        const emptyIndex = board.findIndex(c => c === undefined);
        if (emptyIndex !== -1) {
          const newBoard = [...board];
          newBoard[emptyIndex] = card;
          setBoard(newBoard);
        } else {
          setBoard([...board, card]);
        }
      }
    } else {
      if (hands[activeSelector].filter(c => c !== undefined).length < holeCardsNeeded) {
        // Find the first empty slot (undefined value) or append to the end
        const emptyIndex = hands[activeSelector].findIndex(c => c === undefined);
        if (emptyIndex !== -1) {
          const newHands = [...hands];
          newHands[activeSelector] = [...hands[activeSelector]];
          newHands[activeSelector][emptyIndex] = card;
          setHands(newHands);
        } else {
          const newHands = [...hands];
          newHands[activeSelector] = [...hands[activeSelector], card];
          setHands(newHands);
        }
      }
    }
  };

  // Add a function to remove a card when clicked
  const handleCardRemove = (playerIndex: number | 'board', cardIndex: number) => {
    if (playerIndex === 'board') {
      // Remove card from board but maintain positions
      const newBoard = [...board];
      newBoard[cardIndex] = undefined;
      setBoard(newBoard);
      setEquity(null); // Reset equity calculation when cards change
    } else {
      // Remove card from player's hand but maintain positions
      const newHands = [...hands];
      newHands[playerIndex] = [...newHands[playerIndex]];
      newHands[playerIndex][cardIndex] = undefined;
      setHands(newHands);
      setEquity(null); // Reset equity calculation when cards change
    }
  };

  const calculateResults = () => {
    // Filter out undefined cards before calculation
    const validHands = hands.map(hand => hand.filter((card): card is CardType => card !== undefined));
    const validBoard = board.filter((card): card is CardType => card !== undefined);

    // Make sure each hand has the exact number of cards needed
    if (validHands.every(hand => hand.length === holeCardsNeeded)) {
      setIsCalculating(true);

      // Use setTimeout to allow the UI to update before starting the calculation
      setTimeout(() => {
        try {
          const result = calculateMultiplayerEquity(validHands, validBoard, gameType);
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
    // Reset to empty arrays, not arrays with undefined values
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
    <main className="min-h-screen px-4 py-6 sm:p-8 dark:bg-gray-900">
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-1">
        Made with ❤️ by <a href="https://twitter.com/nomorebear" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Swit</a> & <a href="https://twitter.com/PNattapatsiri" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Paul</a> from <a href="https://orge.xyz/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 dark:hover:text-gray-300">Orge Labs</a>
      </div>
      <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8 pt-3 text-center dark:text-white">
        Poker Equity Calculator
        <span
          className="inline-block ml-2 text-amber-500 cursor-pointer relative text-sm align-text-top transition-colors hover:text-amber-600 active:text-amber-700"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          aria-label="Information about calculation method"
        >
          ⓘ
          {showTooltip && (
            <span
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-72 sm:w-80 p-3 bg-gray-800 text-white dark:bg-gray-700 text-xs leading-tight rounded shadow-lg z-20 mt-1 animate-fade-in border border-amber-500/50"
            >
              For optimal mobile performance, this calculator uses a Monte Carlo simulation with 20,000 random runouts. While this provides a close approximation rather than exact equity, it ensures fast calculations across all devices.
              <div className="mt-2 text-right text-amber-300 text-[10px]">Tap anywhere to close</div>
            </span>
          )}
        </span>
      </h1>

      {/* Close tooltip when clicking anywhere else on the page */}
      {showTooltip && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={() => setShowTooltip(false)}
          aria-hidden="true"
        />
      )}

      <div className="max-w-6xl mx-auto">
        {/* Game controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label className="font-medium dark:text-white">Game Type:</label>
            <select
              value={gameType}
              onChange={(e) => {
                setGameType(e.target.value as GameType);
                reset();
              }}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="texas-holdem">Texas Hold&apos;em</option>
              <option value="super-holdem">Super Hold&apos;em (3 cards)</option>
              <option value="omaha-holdem">Omaha Hold&apos;em</option>
              {/* <option value="short-deck">Short Deck (6+ Hold&apos;em)</option> */}
            </select>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={addPlayer}
              disabled={hands.length >= MAX_PLAYERS}
              className="flex-1 sm:flex-none px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Add Player
            </button>
            <button
              onClick={removePlayer}
              disabled={hands.length <= 2}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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
              className={`space-y-3 p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                activeSelector === index
                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'bg-white shadow dark:bg-gray-800 dark:shadow-gray-700/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold dark:text-white">Player {index + 1}</h2>
                {equity && (
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-medium dark:text-white">
                      Win: {(equity.equities[index] * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Tie: {(equity.ties[index] * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2 flex-wrap">
                  {Array.from({ length: holeCardsNeeded }).map((_, i) => (
                    <div key={i} className="w-10 h-14 sm:w-12 sm:h-16">
                      <Card
                        key={i}
                        card={hand[i]}
                        onClick={hand[i] ? () => handleCardRemove(index, i) : undefined}
                      />
                    </div>
                  ))}
                </div>
                {hands[index].some(card => card !== undefined) && (
                  <button
                    className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 self-center ml-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newHands = [...hands];
                      // Clear by setting all cards to undefined
                      newHands[index] = Array(holeCardsNeeded).fill(undefined);
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
          className={`mb-3 space-y-3 p-4 rounded-lg transition-all cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
            activeSelector === 'board'
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30'
              : 'bg-white shadow dark:bg-gray-800 dark:shadow-gray-700/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold dark:text-white">Board</h2>
            {board.some(card => card !== undefined) && (
              <button
                className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  // Clear by setting all cards to undefined
                  setBoard(Array(5).fill(undefined));
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
                <Card
                  key={i}
                  card={board[i]}
                  onClick={board[i] ? () => handleCardRemove('board', i) : undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card removal hint */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
          <span className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Tip: Click on any placed card to remove it
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={calculateResults}
            className="flex-1 sm:flex-none px-6 py-3 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            disabled={
              // Only check player hands for completeness, board can have any number of cards (0-5)
              !hands.every(hand =>
                hand.filter(card => card !== undefined).length === holeCardsNeeded
              ) ||
              isCalculating
            }
          >
            {isCalculating ? 'Calculating...' : 'Calculate Equity'}
          </button>
          <button
            onClick={reset}
            className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            disabled={isCalculating}
          >
            Reset
          </button>
        </div>

        {/* Card selector */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          <CardSelector
            onSelect={handleCardSelect}
            selectedCards={[
              ...board,
              ...hands.flatMap((hand) => hand),
            ].filter((card): card is CardType => card !== undefined)}
            disabledCards={[
              ...board,
              ...hands.flatMap((hand) => hand),
            ].filter((card): card is CardType => card !== undefined)}
            gameType={gameType}
          />
        </div>

        {/* Loading overlay */}
        {isCalculating && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex flex-col items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium dark:text-white">Calculating equity...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This might take a moment</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
