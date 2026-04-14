/**
 * Home Page
 * Main PDF customizer interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@/components/Canvas';
import { LayerPanel } from '@/components/LayerPanel';
import { Toolbar } from '@/components/Toolbar';
import { ImageAdjustmentPanel } from '@/components/ImageAdjustmentPanel';
import { TextEditPanel } from '@/components/TextEditPanel';
import { PDFPreview } from '@/components/PDFPreview';
import { PDFUpload } from '@/components/PDFUpload';
import { StatusIndicator } from '@/components/StatusIndicator';
import { HelpDialog } from '@/components/HelpDialog';
import { ProjectManager } from '@/components/ProjectManager';
import { useLayerManager } from '@/hooks/useLayerManager';
import { usePersistence } from '@/hooks/usePersistence';
import { useImageAdjustments } from '@/hooks/useImageAdjustments';
import { defaultAssets, loadImageAsBase64, getImageDimensions } from '@/lib/defaultAssets';
import { generatePDFFromLayers, downloadPDF } from '@/lib/pdfGenerator';
import { Layer, TextLayer, ImageAdjustments } from '@/types';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function Home() {
  const {
    layers,
    selectedState,
    addLayer,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    reorderLayers,
    selectLayer,
    deselectAll,
    moveLayerToFront,
    moveLayerToBack,
    clearLayers: clearAllLayers,
  } = useLayerManager([]);

  const { saveProject, loadProject } = usePersistence();
  const { getDefaultAdjustments } = useImageAdjustments();

  const [projectId] = useState(() => nanoid());
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | undefined>();
  const [pdfFileName, setPdfFileName] = useState<string>('');

  // Initialize with default layers
  useEffect(() => {
    const initializeDefaultLayers = async () => {
      // Add default background
      const bgId = addLayer({
        type: 'background',
        name: 'Fundo Padrão',
        position: { x: 0, y: 0 },
        size: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        rotation: 0,
        visible: true,
        locked: false,
        content: defaultAssets.defaultBg,
        applyToAllPages: true,
        adjustments: getDefaultAdjustments(),
      });

      // Add default logo
      const logoId = addLayer({
        type: 'logo',
        name: 'Logo Padrão',
        position: { x: 20, y: 20 },
        size: { width: 100, height: 100 },
        rotation: 0,
        visible: true,
        locked: false,
        content: defaultAssets.defaultLogo,
        applyToAllPages: true,
        adjustments: getDefaultAdjustments(),
      });

      // Add default header text
      const headerId = addLayer({
        type: 'text',
        name: 'Cabeçalho',
        position: { x: 150, y: 30 },
        size: { width: 600, height: 60 },
        rotation: 0,
        visible: true,
        locked: false,
        content: defaultAssets.defaultHeaderText,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        lineHeight: 1.5,
        applyToAllPages: true,
      } as TextLayer);

      // Add default footer text
      const footerId = addLayer({
        type: 'text',
        name: 'Rodapé',
        position: { x: 20, y: CANVAS_HEIGHT - 40 },
        size: { width: CANVAS_WIDTH - 40, height: 30 },
        rotation: 0,
        visible: true,
        locked: false,
        content: defaultAssets.defaultFooterText,
        fontSize: 10,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 1.2,
        applyToAllPages: true,
      } as TextLayer);
    };

    initializeDefaultLayers();
  }, []);

  // Handle adding text layer
  const handleAddText = useCallback(() => {
    const textId = addLayer({
      type: 'text',
      name: `Texto ${layers.filter((l) => l.type === 'text').length + 1}`,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 50 },
      rotation: 0,
      visible: true,
      locked: false,
      content: 'Novo texto',
      fontSize: 16,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      textAlign: 'left',
      lineHeight: 1.5,
    } as TextLayer);

    selectLayer(textId);
    toast.success('Texto adicionado');
  }, [layers, addLayer, selectLayer]);

  // Handle adding image layer
  const handleAddImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const base64 = await loadImageAsBase64(file);
          const { width, height } = await getImageDimensions(base64);
          const aspectRatio = width / height;

          const imgId = addLayer({
            type: 'image',
            name: file.name.split('.')[0],
            position: { x: 100, y: 150 },
            size: { width: 200, height: 200 / aspectRatio },
            rotation: 0,
            visible: true,
            locked: false,
            content: base64,
            adjustments: getDefaultAdjustments(),
          });

          selectLayer(imgId);
          toast.success('Imagem adicionada');
        } catch (error) {
          toast.error('Erro ao carregar imagem');
          console.error(error);
        }
      }
    };
    input.click();
  }, [addLayer, selectLayer, getDefaultAdjustments]);

  // Handle generating PDF
  const handleGeneratePDF = useCallback(async () => {
    try {
      toast.loading('Gerando PDF...');
      const buffer = await generatePDFFromLayers(layers, pdfBuffer);
      downloadPDF(buffer, 'documento-personalizado.pdf');
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF');
      console.error(error);
    }
  }, [layers, pdfBuffer]);

  // Handle clearing all layers
  const handleClearAll = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todas as camadas?')) {
      clearAllLayers();
      toast.success('Camadas limpas');
    }
  }, [clearAllLayers]);

  // Handle text update
  const handleTextUpdate = useCallback(
    (key: string, value: any) => {
      if (selectedState.selectedLayerId) {
        updateLayer(selectedState.selectedLayerId, {
          [key]: value,
        });
      }
    },
    [selectedState.selectedLayerId, updateLayer]
  );

  // Handle image adjustment update
  const handleImageAdjustmentUpdate = useCallback(
    (adjustments: ImageAdjustments) => {
      if (selectedState.selectedLayerId) {
        updateLayer(selectedState.selectedLayerId, {
          adjustments,
        });
      }
    },
    [selectedState.selectedLayerId, updateLayer]
  );

  // Handle adjustment reset
  const handleResetAdjustments = useCallback(() => {
    if (selectedState.selectedLayerId) {
      updateLayer(selectedState.selectedLayerId, {
        adjustments: getDefaultAdjustments(),
      });
    }
  }, [selectedState.selectedLayerId, updateLayer, getDefaultAdjustments]);

  const selectedLayer = layers.find((l) => l.id === selectedState.selectedLayerId);

  // Handle PDF file upload
  const handlePDFUpload = useCallback((buffer: ArrayBuffer, fileName: string) => {
    setPdfBuffer(buffer);
    setPdfFileName(fileName);
  }, []);

  // Handle PDF file removal
  const handlePDFRemove = useCallback(() => {
    setPdfBuffer(undefined);
    setPdfFileName('');
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF Customizer PWA</h1>
          <p className="text-sm text-gray-600">Personalize seus documentos PDF com facilidade</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator />
          <HelpDialog />
          <ProjectManager currentProjectName={pdfFileName || 'Sem título'} />
        </div>
      </div>

      {/* PDF Upload Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between gap-4">
        <PDFUpload
          onFileLoaded={handlePDFUpload}
          onFileRemoved={handlePDFRemove}
          fileName={pdfFileName}
        />
        <Toolbar
          onAddText={handleAddText}
          onAddImage={handleAddImage}
          onClearAll={handleClearAll}
          onGeneratePDF={handleGeneratePDF}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left: PDF Preview or Canvas */}
        <div className="flex-1 flex flex-col">
          {pdfBuffer ? (
            <PDFPreview pdfBuffer={pdfBuffer} />
          ) : (
            <div className="flex-1 bg-gray-200 rounded-lg overflow-auto flex items-center justify-center p-4">
              <Canvas
                layers={layers}
                selectedLayerId={selectedState.selectedLayerId}
                onLayerSelect={selectLayer}
                onLayerUpdate={updateLayer}
                onLayerDelete={deleteLayer}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={CANVAS_HEIGHT}
              />
            </div>
          )}
        </div>

        {/* Right panels */}
        <div className="flex gap-4 w-96">
          {/* Layer panel */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <LayerPanel
              layers={layers}
              selectedLayerId={selectedState.selectedLayerId}
              onLayerSelect={selectLayer}
              onLayerDelete={deleteLayer}
              onLayerDuplicate={duplicateLayer}
              onLayerUpdate={updateLayer}
              onLayerReorder={reorderLayers}
              onMoveToFront={moveLayerToFront}
              onMoveToBack={moveLayerToBack}
            />
          </div>

          {/* Adjustment panels */}
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            {selectedLayer?.type === 'text' ? (
              <TextEditPanel
                layer={selectedLayer as TextLayer}
                onTextChange={(text) => handleTextUpdate('content', text)}
                onPropertyChange={handleTextUpdate}
              />
            ) : selectedLayer?.type === 'image' ||
              selectedLayer?.type === 'logo' ||
              selectedLayer?.type === 'background' ? (
              <ImageAdjustmentPanel
                layer={selectedLayer}
                onAdjustmentChange={handleImageAdjustmentUpdate}
                onReset={handleResetAdjustments}
              />
            ) : (
              <div className="p-4 text-gray-500 text-sm">
                Selecione uma camada para editar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-600">
        <p>
          Gostou? Considere fazer uma doação via PIX:{' '}
          <button
            onClick={() => {
              navigator.clipboard.writeText('lunara_terapias@jim.com');
              toast.success('Chave PIX copiada!');
            }}
            className="font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            lunara_terapias@jim.com
          </button>
        </p>
      </div>
    </div>
  );
}
