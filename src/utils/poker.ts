import { Hand } from 'pokersolver';

export type Card = {
  rank: string;
  suit: string;
};

export type GameType = 'texas-holdem' | 'short-deck' | 'omaha-holdem' | 'super-holdem';

export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

// All ranks for Texas Hold'em
export const TEXAS_RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// Ranks for Short Deck (6+ Hold'em)
export const SHORT_DECK_RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

// Number of hole cards per game type
export const HOLE_CARDS_COUNT: Record<GameType, number> = {
  'texas-holdem': 2,
  'super-holdem': 3,
  'omaha-holdem': 4,
  'short-deck': 2
};

function combinations<T>(arr: T[], r: number): T[][] {
  if (r === 0) return [[]];
  if (r > arr.length) return [];

  const first = arr[0];
  const rest = arr.slice(1);

  // Combinations that include the first element
  const combsWithFirst = combinations(rest, r - 1).map(comb => [first, ...comb]);
  // Combinations that don't include the first element
  const combsWithoutFirst = combinations(rest, r);

  return [...combsWithFirst, ...combsWithoutFirst];
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function calculateMultiplayerEquity(
  hands: Card[][],
  board: Card[] = [],
  gameType: GameType = 'texas-holdem'
): { equities: number[]; ties: number[] } {
  if (hands.length < 2 || hands.length > 6) {
    throw new Error('Number of players must be between 2 and 6');
  }

  const wins = new Array(hands.length).fill(0);
  const ties = new Array(hands.length).fill(0);

  // Convert cards to pokersolver format
  const formatCard = (card: Card) => `${card.rank}${card.suit}`;
  const handStrs = hands.map(hand => hand.map(formatCard));
  const boardStr = board.map(formatCard);

  // Create deck excluding known cards
  const usedCards = new Set([...boardStr, ...handStrs.flat()]);
  const ranks = gameType === 'short-deck' ? SHORT_DECK_RANKS : TEXAS_RANKS;
  const deck: string[] = [];
  for (const rank of ranks) {
    for (const suit of SUITS) {
      const card = `${rank}${suit}`;
      if (!usedCards.has(card)) {
        deck.push(card);
      }
    }
  }

  // Calculate how many cards we need to complete the board
  const remainingCards = 5 - board.length;

  // Function to evaluate hands based on game type
  const evaluateHands = (finalBoard: string[], handStrs: string[][]) => {
    return handStrs.map(hand => {
      if (gameType === 'omaha-holdem') {
        // For Omaha, we need to consider all combinations of 2 hole cards and 3 board cards
        const holeCardCombos = combinations(hand, 2);
        const boardCardCombos = combinations(finalBoard, 3);

        // Find the best hand among all possible combinations
        let bestHand: Hand | null = null;
        for (const holeComb of holeCardCombos) {
          for (const boardComb of boardCardCombos) {
            const currentHand = Hand.solve([...holeComb, ...boardComb]);
            if (!bestHand || currentHand.compare(bestHand) < 0) {
              bestHand = currentHand;
            }
          }
        }
        // Return a default hand if bestHand is null (should never happen)
        return bestHand || Hand.solve([...hand.slice(0, 2), ...finalBoard.slice(0, 3)]);
      } else if (gameType === 'super-holdem') {
        // For Super Hold'em, players can use any of their hole cards with any board cards
        // We need to find the best 5-card hand from any 7 cards chosen from the 8 available cards

        // Combine hole cards and board cards
        const allCards = [...hand, ...finalBoard];

        // If we have 8 cards (full 3 hole cards + 5 board cards), generate all combinations of 7
        let bestHand: Hand | null = null;

        if (allCards.length > 7) {
          // Generate all combinations of 7 cards from the available cards
          const combos = combinations(allCards, 7);

          // Find the best hand among all combinations
          for (const combo of combos) {
            const currentHand = Hand.solve(combo);
            if (!bestHand || currentHand.compare(bestHand) < 0) {
              bestHand = currentHand;
            }
          }
        } else {
          // If we have 7 or fewer cards, just use all available cards
          bestHand = Hand.solve(allCards);
        }

        // Return a default hand if bestHand is null (should never happen)
        return bestHand || Hand.solve(allCards);
      } else if (gameType === 'texas-holdem') {
        // For other game types, we use all hole cards and board cards
        return Hand.solve([...hand, ...finalBoard]);
      } else {
        throw new Error(`Unsupported game type: ${gameType}`);
      }
    });
  };

  // Use combinations for 1-2 cards, Monte Carlo for 3+ cards
  if (remainingCards <= 2) {
    // Use exact combinations
    const possibleBoards = combinations(deck, remainingCards);
    const totalCombinations = possibleBoards.length;

    for (const remainingBoard of possibleBoards) {
      const finalBoard = [...boardStr, ...remainingBoard];
      const results = evaluateHands(finalBoard, handStrs);
      // Filter out any null values (though there shouldn't be any)
      const validResults = results.filter((result): result is Hand => result !== null);
      const winners = Hand.winners(validResults);

      if (winners.length > 1) {
        // For each player in the tie, increment their tie counter
        results.forEach((result, index) => {
          if (result && winners.includes(result)) {
            ties[index]++;
          }
        });
      } else if (winners.length === 1) {
        const winnerIndex = results.findIndex(result => result === winners[0]);
        if (winnerIndex !== -1) {
          wins[winnerIndex]++;
        }
      }
    }

    return {
      equities: wins.map(w => w / totalCombinations),
      ties: ties.map(t => t / totalCombinations),
    };
  } else {
    // Use Monte Carlo simulation for 3+ cards
    let iterations = 5000;
    if (gameType === 'texas-holdem') {
      iterations = 50000;
    } else if (gameType === 'super-holdem') {
      iterations = 10000;
    } else if (gameType === 'omaha-holdem') {
      iterations = 2000;
    } else {
      throw new Error(`Unsupported game type: ${gameType}`);
    }

    for (let i = 0; i < iterations; i++) {
      const shuffledDeck = shuffle(deck);
      const finalBoard = [...boardStr, ...shuffledDeck.slice(0, remainingCards)];
      const results = evaluateHands(finalBoard, handStrs);
      // Filter out any null values (though there shouldn't be any)
      const validResults = results.filter((result): result is Hand => result !== null);
      const winners = Hand.winners(validResults);

      if (winners.length > 1) {
        // For each player in the tie, increment their tie counter
        results.forEach((result, index) => {
          if (result && winners.includes(result)) {
            ties[index]++;
          }
        });
      } else if (winners.length === 1) {
        const winnerIndex = results.findIndex(result => result === winners[0]);
        if (winnerIndex !== -1) {
          wins[winnerIndex]++;
        }
      }
    }

    return {
      equities: wins.map(w => w / iterations),
      ties: ties.map(t => t / iterations),
    };
  }
}
