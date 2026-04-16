/**
 * AlignmentToolbar Component
 * Provides alignment and distribution controls for selected layers
 */

import React from 'react';
import { Layer } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Columns3,
  Rows3,
} from 'lucide-react';
import { AlignmentType, calculateAlignedPosition, distributeLayersHorizontally, distributeLayersVertically } from '@/lib/alignmentUtils';

interface AlignmentToolbarProps {
  selectedLayers: Layer[];
  allLayers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
}

export const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({
  selectedLayers,
  allLayers,
  canvasWidth,
  canvasHeight,
  onLayerUpdate,
}) => {
  if (selectedLayers.length === 0) {
    return null;
  }

  const handleAlign = (alignment: AlignmentType) => {
    selectedLayers.forEach((layer) => {
      const newPosition = calculateAlignedPosition(layer, canvasWidth, canvasHeight, alignment);
      onLayerUpdate(layer.id, { position: newPosition });
    });
  };

  const handleDistribute = (type: 'horizontal' | 'vertical') => {
    if (selectedLayers.length < 2) return;

    if (type === 'horizontal') {
      const positions = distributeLayersHorizontally(selectedLayers, canvasWidth);
      Object.entries(positions).forEach(([id, position]) => {
        onLayerUpdate(id, { position });
      });
    } else {
      const positions = distributeLayersVertically(selectedLayers, canvasHeight);
      Object.entries(positions).forEach(([id, position]) => {
        onLayerUpdate(id, { position });
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {/* Horizontal alignment */}
        <div className="flex gap-1 border-r border-gray-200 pr-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('left')}
            title="Alinhar à Esquerda (Ctrl+Alt+L)"
            className="px-2"
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('center')}
            title="Centralizar Horizontalmente (Ctrl+Alt+C)"
            className="px-2"
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('right')}
            title="Alinhar à Direita (Ctrl+Alt+R)"
            className="px-2"
          >
            <AlignRight size={16} />
          </Button>
        </div>

        {/* Vertical alignment */}
        <div className="flex gap-1 border-r border-gray-200 pr-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('top')}
            title="Alinhar ao Topo (Ctrl+Alt+T)"
            className="px-2"
          >
            <ArrowUp size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('middle')}
            title="Centralizar Verticalmente (Ctrl+Alt+M)"
            className="px-2"
          >
            <Rows3 size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAlign('bottom')}
            title="Alinhar à Base (Ctrl+Alt+B)"
            className="px-2"
          >
            <ArrowDown size={16} />
          </Button>
        </div>

        {/* Distribution */}
        {selectedLayers.length >= 2 && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDistribute('horizontal')}
              title="Distribuir Horizontalmente (Ctrl+Alt+H)"
              className="px-2"
            >
              <Columns3 size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDistribute('vertical')}
              title="Distribuir Verticalmente (Ctrl+Alt+V)"
              className="px-2"
            >
              <Rows3 size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-gray-500 mt-2">
        {selectedLayers.length} camada{selectedLayers.length !== 1 ? 's' : ''} selecionada{selectedLayers.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
};
