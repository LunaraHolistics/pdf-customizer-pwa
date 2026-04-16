/**
 * HistoryPanel Component
 * Displays and manages version history/snapshots
 */

import React from 'react';
import { HistorySnapshot } from '@/hooks/useHistoryManager';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, RotateCcw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryPanelProps {
  history: HistorySnapshot[];
  currentIndex: number;
  onGoToSnapshot: (index: number) => void;
  onDeleteSnapshot: (index: number) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentIndex,
  onGoToSnapshot,
  onDeleteSnapshot,
}) => {
  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'Há pouco';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Histórico</h2>
        </div>
        <p className="text-xs text-gray-500">
          {history.length} versão{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Nenhuma versão salva</p>
            </div>
          ) : (
            history.map((snapshot, index) => (
              <div
                key={snapshot.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all group
                  ${
                    currentIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
                onClick={() => onGoToSnapshot(index)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {snapshot.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(snapshot.timestamp)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {snapshot.layers.length} camada{snapshot.layers.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {currentIndex === index && (
                    <div className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Atual
                    </div>
                  )}
                </div>

                {/* Delete button */}
                {history.length > 1 && currentIndex !== index && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSnapshot(index);
                    }}
                    className="mt-2 w-full p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Deletar versão"
                  >
                    <Trash2 size={14} className="mx-auto" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Info footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
        <p>Clique em uma versão para restaurá-la</p>
      </div>
    </div>
  );
};
