
import React, { useState, useRef, useCallback } from 'react';
import { ProfessionalStyle, TransformationState } from './types';
import { transformPhoto } from './services/geminiService';
import StyleSelector from './components/StyleSelector';

const App: React.FC = () => {
  const [state, setState] = useState<TransformationState>({
    originalImage: null,
    resultImage: null,
    isProcessing: false,
    error: null,
    selectedStyle: ProfessionalStyle.MALE_SUIT,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setState(prev => ({ ...prev, error: "파일 크기가 너무 큽니다. (최대 10MB)" }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          originalImage: e.target?.result as string,
          resultImage: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!state.originalImage) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const result = await transformPhoto(state.originalImage, state.selectedStyle);
      setState(prev => ({
        ...prev,
        resultImage: result,
        isProcessing: false
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: err.message || "이미지 변환 중 오류가 발생했습니다."
      }));
    }
  };

  const handleDownload = () => {
    if (!state.resultImage) return;
    const link = document.createElement('a');
    link.href = state.resultImage;
    link.download = `professional_profile_${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setState({
      originalImage: null,
      resultImage: null,
      isProcessing: false,
      error: null,
      selectedStyle: ProfessionalStyle.MALE_SUIT,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-indigo-100 text-indigo-600">
          <i className="fa-solid fa-user-tie text-3xl"></i>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">AI 프로페셔널 프로필 메이커</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          셀카나 일상 사진을 업로드하세요. AI가 즉시 신뢰감 있는 이력서용 사진으로 변환해 드립니다.
        </p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Input */}
        <div className="flex flex-col space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. 사진 업로드</h2>
            <div 
              onClick={() => !state.isProcessing && fileInputRef.current?.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                state.originalImage ? 'border-indigo-400' : 'border-gray-300 hover:border-indigo-300 bg-gray-50'
              } ${state.isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {state.originalImage ? (
                <img src={state.originalImage} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-10">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-gray-300 mb-3"></i>
                  <p className="text-sm text-gray-500 font-medium">클릭하여 사진 선택</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (최대 10MB)</p>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. 스타일 선택</h2>
            <StyleSelector 
              selected={state.selectedStyle} 
              onSelect={(style) => setState(prev => ({ ...prev, selectedStyle: style }))}
              disabled={state.isProcessing}
            />
          </div>

          <button
            onClick={handleTransform}
            disabled={!state.originalImage || state.isProcessing}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
              !state.originalImage || state.isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'gradient-bg text-white hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {state.isProcessing ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                AI가 변환 중...
              </span>
            ) : (
              '전문가 사진으로 변환하기'
            )}
          </button>

          {state.error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start">
              <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2"></i>
              {state.error}
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">결과 미리보기</h2>
              {state.resultImage && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownload}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    title="다운로드"
                  >
                    <i className="fa-solid fa-download"></i>
                  </button>
                  <button 
                    onClick={reset}
                    className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                    title="새로 시작"
                  >
                    <i className="fa-solid fa-rotate-right"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 relative rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
              {state.resultImage ? (
                <img src={state.resultImage} alt="Result" className="w-full h-full object-contain" />
              ) : state.isProcessing ? (
                <div className="text-center px-6">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-medium">조금만 기다려 주세요...</p>
                  <p className="text-xs text-gray-400 mt-2 italic">정장 착용 및 배경 보정 작업 중입니다</p>
                </div>
              ) : (
                <div className="text-center text-gray-300">
                  <i className="fa-solid fa-image text-6xl mb-4"></i>
                  <p>왼쪽에서 사진을 선택하고<br/>변환 버튼을 눌러주세요</p>
                </div>
              )}
            </div>
            
            {state.resultImage && (
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-blue-800 text-sm">
                <p className="font-semibold mb-1">💡 만족하시나요?</p>
                <p>결과 이미지를 다운로드하여 링크드인, 이력서, 프로필 사진으로 사용해보세요. 만족스럽지 않다면 다른 스타일을 선택해 다시 시도해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 text-center text-gray-400 text-sm pb-10">
        <p>&copy; 2024 AI Professional Profile Maker. Powered by Gemini.</p>
        <p className="mt-1">개인정보 보호를 위해 업로드된 원본 이미지는 서버에 저장되지 않습니다.</p>
      </footer>
    </div>
  );
};

export default App;
