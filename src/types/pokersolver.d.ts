declare module 'pokersolver' {
  export class Hand {
    static solve(cards: string[]): Hand;
    static winners(hands: Hand[]): Hand[];
    name: string;
    cards: string[];
    descr: string;
    compare(hand: Hand): number;
    toString(): string;
  }
}
