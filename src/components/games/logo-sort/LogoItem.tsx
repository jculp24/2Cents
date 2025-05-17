import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface LogoItemProps {
  id: string;
  name: string;
  image: string;
  isSorted: boolean;
  sortedBinId?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

const LogoItem = ({ 
  id, 
  name, 
  image, 
  isSorted, 
  sortedBinId,
  onDragStart,
  onDragEnd
}: LogoItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // We'll use Framer Motion's own drag handlers instead of our custom hook
  const handleDragStart = (event: any, info: any) => {
    if (isSorted) return;
    setIsDragging(true);
    if (onDragStart) onDragStart();
  };
  
  const handleDragEnd = (event: any, info: any) => {
    if (isSorted) return;
    setIsDragging(false);
    if (onDragEnd) onDragEnd();
  };

  return (
    <motion.div
      className={`relative rounded-full overflow-hidden border-2 w-14 h-14 flex items-center justify-center bg-white
        ${isDragging 
          ? 'border-bronze shadow-lg z-10' 
          : isSorted 
            ? 'border-bronze/50 opacity-50' 
            : 'border-transparent hover:border-bronze/30'}
        transition-all`}
      whileTap={{ scale: isSorted ? 1 : 0.95 }}
      drag={!isSorted}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ cursor: isSorted ? 'default' : 'grab' }}
      data-logo-id={id}
    >
      <img 
        src={image} 
        alt={name} 
        className="w-10 h-10 object-contain rounded-full" 
      />
      {isSorted && (
        <div className="absolute top-0 right-0 bg-bronze rounded-bl-full p-1">
          <Check size={12} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default LogoItem;
