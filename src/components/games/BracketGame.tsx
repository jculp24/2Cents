import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BracketGameProps {
  data: any;
  onProgress: () => void;
}

const BRACKET_SIZE = 8;

const padToEight = (items: any[]) => {
  const padded = [...items];
  while (padded.length < BRACKET_SIZE) {
    padded.push({ id: `empty-${padded.length}`, title: '', image: '', empty: true });
  }
  return padded.slice(0, BRACKET_SIZE);
};

const BracketGame = ({ data, onProgress }: BracketGameProps) => {
  // Always use 8 options
  const initialItems = padToEight(data?.items || []);
  
  // Create initial bracket structure
  const [rounds, setRounds] = useState<any[][]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [winner, setWinner] = useState<any>(null);
  
  // Initialize the bracket when component mounts
  useEffect(() => {
    if (initialItems.length > 0) {
      setRounds([initialItems]);
    }
  }, [data]);
  
  // Handle winner selection for a matchup
  const handleSelectWinner = (matchIdx: number, item: any) => {
    // Add the winner to the next round
    const nextRound = rounds[currentRound + 1] || [];
    const updatedNextRound = [...nextRound];
    updatedNextRound[matchIdx] = item;
    
    // Update the rounds array
    const updatedRounds = [...rounds];
    updatedRounds[currentRound + 1] = updatedNextRound;
    setRounds(updatedRounds);
    
    // If all winners for this round are selected, move to next round
    if (updatedNextRound.filter(Boolean).length === Math.ceil(rounds[currentRound].length / 2)) {
      if (currentRound + 1 < Math.log2(BRACKET_SIZE)) {
        setCurrentRound(currentRound + 1);
      } else {
        // We have a final winner
        setWinner(item);
      }
    }
    
    // Report progress
    onProgress();
  };
  
  // If no items, show a placeholder
  if (initialItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }
  
  // If we have a winner, show the final result
  if (winner) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Winner!</div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-40 h-40 mx-auto mb-4 overflow-hidden rounded-xl border-4 border-bronze"
          >
            <img 
              src={winner.image} 
              alt={winner.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <h3 className="font-semibold">{winner.title}</h3>
        </div>
      </div>
    );
  }
  
  // Check if rounds array is empty or currentRound is out of bounds
  if (!rounds || rounds.length === 0 || !rounds[currentRound]) {
    return (
      <div className="flex items-center justify-center h-60">
        <p className="text-muted-foreground">Loading bracket...</p>
      </div>
    );
  }
  
  // Render all matchups for the current round
  const matchups = [];
  for (let i = 0; i < rounds[currentRound].length; i += 2) {
    const itemA = rounds[currentRound][i];
    const itemB = rounds[currentRound][i + 1];
    matchups.push({ itemA, itemB, matchIdx: i / 2 });
  }
  
  // Prepare next round slots
  const nextRound = rounds[currentRound + 1] || Array(Math.ceil(rounds[currentRound].length / 2)).fill(null);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-row w-full justify-center gap-8">
        {/* Current round */}
        <div>
          <div className="font-bold text-center mb-2">Round {currentRound + 1}</div>
          <div className="flex flex-col gap-4">
            {matchups.map(({ itemA, itemB, matchIdx }) => (
              <div key={matchIdx} className="flex items-center gap-2">
                <motion.div
                  whileHover={!itemA.empty ? { scale: 1.05 } : {}}
                  whileTap={!itemA.empty ? { scale: 0.95 } : {}}
                  onClick={() => !itemA.empty && handleSelectWinner(matchIdx, itemA)}
                  className={`flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer transition-colors
                    ${itemA.empty ? 'opacity-30 pointer-events-none' : 'hover:border-bronze/50'}`}
                  style={{ minWidth: 80, minHeight: 80 }}
                >
                  {itemA.image && <img src={itemA.image} alt={itemA.title} className="w-full h-16 object-cover" />}
                  <div className="p-2 text-center text-xs">{itemA.title}</div>
                </motion.div>
                <span className="font-bold text-bronze">VS</span>
                <motion.div
                  whileHover={!itemB.empty ? { scale: 1.05 } : {}}
                  whileTap={!itemB.empty ? { scale: 0.95 } : {}}
                  onClick={() => !itemB.empty && handleSelectWinner(matchIdx, itemB)}
                  className={`flex-1 bg-card rounded-lg overflow-hidden border border-border cursor-pointer transition-colors
                    ${itemB.empty ? 'opacity-30 pointer-events-none' : 'hover:border-bronze/50'}`}
                  style={{ minWidth: 80, minHeight: 80 }}
                >
                  {itemB.image && <img src={itemB.image} alt={itemB.title} className="w-full h-16 object-cover" />}
                  <div className="p-2 text-center text-xs">{itemB.title}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
        {/* Next round */}
        <div>
          <div className="font-bold text-center mb-2">Next Round</div>
          <div className="flex flex-col gap-8">
            {nextRound.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center">
                <div className="w-20 h-20 bg-card rounded-lg border border-border flex items-center justify-center text-center">
                  {item ? (item.title || <span className="text-muted-foreground">TBD</span>) : <span className="text-muted-foreground">TBD</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketGame;
