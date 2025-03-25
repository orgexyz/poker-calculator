import { useCallback, useMemo } from 'react';
import { Card } from './Card';
import {
  type Card as CardType,
  SUITS,
  GameType,
  TEXAS_RANKS,
  SHORT_DECK_RANKS
} from '@/utils/poker';

interface CardSelectorProps {
  onSelect: (card: CardType) => void;
  selectedCards: CardType[];
  disabledCards?: CardType[];
  gameType: GameType;
}

export function CardSelector({ onSelect, selectedCards, disabledCards = [], gameType }: CardSelectorProps) {
  // Only Short Deck uses reduced ranks, all other variants use full 52-card deck
  const ranks = gameType === 'short-deck' ? SHORT_DECK_RANKS : TEXAS_RANKS;

  const isSelected = useCallback(
    (card: CardType) => {
      return selectedCards.some((c) => c.rank === card.rank && c.suit === card.suit);
    },
    [selectedCards]
  );

  const isDisabled = useCallback(
    (card: CardType) => {
      return disabledCards.some((c) => c.rank === card.rank && c.suit === card.suit);
    },
    [disabledCards]
  );

  // Generate all cards in the deck
  const allCards = useMemo(() => {
    const cards: CardType[] = [];
    for (const suit of SUITS) {
      for (const rank of ranks) {
        cards.push({ rank, suit });
      }
    }
    return cards;
  }, [ranks]);

  return (
    <div className="p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 overflow-x-auto max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-13 gap-2 sm:gap-3">
        {allCards.map((card) => (
          <div
            key={`${card.rank}${card.suit}`}
            className="aspect-[3/4] w-8 h-12 sm:w-10 sm:h-14"
          >
            <Card
              card={card}
              onClick={() => onSelect(card)}
              selected={isSelected(card)}
              disabled={isDisabled(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
