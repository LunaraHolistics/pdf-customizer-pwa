/**
 * Alignment Utilities
 * Functions for aligning layers on the canvas
 */

import { Layer, Position } from '@/types';

export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v';

/**
 * Calculate aligned position for a layer
 */
export const calculateAlignedPosition = (
  layer: Layer,
  canvasWidth: number,
  canvasHeight: number,
  alignment: AlignmentType
): Position => {
  const layerWidth = layer.size.width;
  const layerHeight = layer.size.height;

  switch (alignment) {
    case 'left':
      return { x: 0, y: layer.position.y };
    
    case 'center':
      return { x: (canvasWidth - layerWidth) / 2, y: layer.position.y };
    
    case 'right':
      return { x: canvasWidth - layerWidth, y: layer.position.y };
    
    case 'top':
      return { x: layer.position.x, y: 0 };
    
    case 'middle':
      return { x: layer.position.x, y: (canvasHeight - layerHeight) / 2 };
    
    case 'bottom':
      return { x: layer.position.x, y: canvasHeight - layerHeight };
    
    default:
      return layer.position;
  }
};

/**
 * Distribute layers evenly horizontally
 */
export const distributeLayersHorizontally = (
  layers: Layer[],
  canvasWidth: number
): Record<string, Position> => {
  if (layers.length < 2) return {};

  const sortedByX = [...layers].sort((a, b) => a.position.x - b.position.x);
  const firstX = sortedByX[0].position.x;
  const lastX = sortedByX[sortedByX.length - 1].position.x;
  const totalDistance = lastX - firstX;
  const step = totalDistance / (layers.length - 1);

  const result: Record<string, Position> = {};
  sortedByX.forEach((layer, index) => {
    result[layer.id] = {
      x: firstX + step * index,
      y: layer.position.y,
    };
  });

  return result;
};

/**
 * Distribute layers evenly vertically
 */
export const distributeLayersVertically = (
  layers: Layer[],
  canvasHeight: number
): Record<string, Position> => {
  if (layers.length < 2) return {};

  const sortedByY = [...layers].sort((a, b) => a.position.y - b.position.y);
  const firstY = sortedByY[0].position.y;
  const lastY = sortedByY[sortedByY.length - 1].position.y;
  const totalDistance = lastY - firstY;
  const step = totalDistance / (layers.length - 1);

  const result: Record<string, Position> = {};
  sortedByY.forEach((layer, index) => {
    result[layer.id] = {
      x: layer.position.x,
      y: firstY + step * index,
    };
  });

  return result;
};

/**
 * Get alignment label in Portuguese
 */
export const getAlignmentLabel = (alignment: AlignmentType): string => {
  const labels: Record<AlignmentType, string> = {
    'left': 'Alinhar à Esquerda',
    'center': 'Centralizar Horizontalmente',
    'right': 'Alinhar à Direita',
    'top': 'Alinhar ao Topo',
    'middle': 'Centralizar Verticalmente',
    'bottom': 'Alinhar à Base',
    'distribute-h': 'Distribuir Horizontalmente',
    'distribute-v': 'Distribuir Verticalmente',
  };
  return labels[alignment];
};
