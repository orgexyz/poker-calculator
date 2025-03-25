import { type Card as CardType, SUIT_SYMBOLS } from '@/utils/poker';
import classNames from 'classnames';

interface CardProps {
  card?: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function Card({ card, onClick, selected, disabled }: CardProps) {
  const isRed = card?.suit === 'h' || card?.suit === 'd';

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={classNames(
        'w-full h-full rounded-md sm:rounded-lg border flex items-center justify-center transition-all',
        {
          'cursor-pointer hover:scale-105': !disabled && onClick,
          'cursor-not-allowed opacity-50': disabled,
          'bg-white': card && !selected,
          'bg-gray-100': !card,
          'bg-blue-500 text-white': selected,
          'border-blue-500': selected,
          'border-gray-200': !selected,
          'text-red-600': isRed && !selected,
          'text-black': !isRed && !selected,
        }
      )}
    >
      {card ? (
        <div className="text-sm sm:text-base font-bold">
          {card.rank}
          {SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}
        </div>
      ) : (
        <div className="text-gray-400 text-sm sm:text-base">?</div>
      )}
    </div>
  );
}
