/**
 * LayerPanel Component
 * Displays list of layers with controls for selection, visibility, and deletion
 */

import React from 'react';
import { Layer } from '@/types';
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onLayerSelect: (id: string | null) => void;
  onLayerDelete: (id: string) => void;
  onLayerDuplicate: (id: string) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onMoveToFront: (id: string) => void;
  onMoveToBack: (id: string) => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerDelete,
  onLayerDuplicate,
  onLayerUpdate,
  onMoveToFront,
  onMoveToBack,
}) => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Camadas</h2>
        <p className="text-sm text-gray-500">Total: {layers.length}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {sortedLayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhuma camada adicionada</p>
            </div>
          ) : (
            sortedLayers.map((layer, index) => (
              <div
                key={layer.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    selectedLayerId === layer.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Layer icon */}
                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {layer.type === 'text' ? 'T' : 'I'}
                  </div>

                  {/* Layer name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{layer.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{layer.type}</p>
                  </div>

                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerUpdate(layer.id, { visible: !layer.visible });
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={layer.visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {layer.visible ? (
                      <Eye size={16} className="text-gray-600" />
                    ) : (
                      <EyeOff size={16} className="text-gray-400" />
                    )}
                  </button>

                  {/* Lock toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayerUpdate(layer.id, { locked: !layer.locked });
                    }}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={layer.locked ? 'Desbloquear' : 'Bloquear'}
                  >
                    {layer.locked ? (
                      <Lock size={16} className="text-gray-600" />
                    ) : (
                      <Unlock size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Action buttons */}
                {selectedLayerId === layer.id && (
                  <div className="flex gap-1 mt-2 pt-2 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToFront(layer.id);
                      }}
                      title="Trazer para frente"
                      className="flex-1"
                    >
                      <ChevronUp size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToBack(layer.id);
                      }}
                      title="Enviar para trás"
                      className="flex-1"
                    >
                      <ChevronDown size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerDuplicate(layer.id);
                      }}
                      title="Duplicar"
                      className="flex-1"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayerDelete(layer.id);
                      }}
                      title="Deletar"
                      className="flex-1"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
