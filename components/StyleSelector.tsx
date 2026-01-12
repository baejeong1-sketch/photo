
import React from 'react';
import { ProfessionalStyle } from '../types';

interface StyleSelectorProps {
  selected: ProfessionalStyle;
  onSelect: (style: ProfessionalStyle) => void;
  disabled: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selected, onSelect, disabled }) => {
  const styles = Object.values(ProfessionalStyle);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
      {styles.map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          disabled={disabled}
          className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
            selected === style
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
              : 'border-gray-200 hover:border-indigo-300 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {style}
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;
