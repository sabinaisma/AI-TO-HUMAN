import React, { useState } from 'react';
import { 
  Wand2, 
  ShieldCheck, 
  FileText, 
  Copy, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  Eraser,
  PenLine
} from 'lucide-react';
import { AnalysisState, HumanizeState, TabOption } from './types';
import { detectAIContent, humanizeContent } from './services/gemini';
import FileUploader from './components/FileUploader';
import Button from './components/ui/Button';
import DetectionGauge from './components/DetectionGauge';
import { MAX_CHAR_LIMIT } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.WRITE);
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null
  });

  const [humanization, setHumanization] = useState<HumanizeState>({
    isHumanizing: false,
    result: null,
    error: null
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setFileName(null);
    // Reset states if text changes significantly? No, let user decide when to re-run.
  };

  const handleFileExtracted = (text: string, name: string) => {
    setInputText(text);
    setFileName(name);
    // Reset previous results
    setAnalysis({ isAnalyzing: false, result: null, error: null });
    setHumanization({ isHumanizing: false, result: null, error: null });
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setAnalysis({ isAnalyzing: true, result: null, error: null });
    try {
      const result = await detectAIContent(inputText);
      setAnalysis({ isAnalyzing: false, result, error: null });
    } catch (err: any) {
      setAnalysis({ isAnalyzing: false, result: null, error: err.message });
    }
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;

    setHumanization({ isHumanizing: true, result: null, error: null });
    try {
      const result = await humanizeContent(inputText);
      setHumanization({ isHumanizing: false, result, error: null });
    } catch (err: any) {
      setHumanization({ isHumanizing: false, result: null, error: err.message });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AuthenticAI
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <span className="hidden sm:inline">Powered by Gemini 2.5</span>
            <div className="h-4 w-px bg-slate-800"></div>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Input */}
          <section className="flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Input Content</h2>
              <p className="text-slate-400 text-sm">Paste your text or upload a document to analyze.</p>
            </div>

            <div className="bg-dark-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[600px]">
              {/* Tabs */}
              <div className="flex border-b border-slate-700">
                <button
                  onClick={() => setActiveTab(TabOption.WRITE)}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === TabOption.WRITE 
                      ? 'bg-dark-700/50 text-indigo-400 border-b-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700/30'
                  }`}
                >
                  <PenLine className="w-4 h-4" /> Write / Paste
                </button>
                <button
                  onClick={() => setActiveTab(TabOption.UPLOAD)}
                  className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    activeTab === TabOption.UPLOAD 
                      ? 'bg-dark-700/50 text-indigo-400 border-b-2 border-indigo-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700/30'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Upload File
                </button>
              </div>

              {/* Input Area */}
              <div className="flex-1 p-6 flex flex-col min-h-0">
                {activeTab === TabOption.WRITE ? (
                  <textarea
                    className="flex-1 w-full bg-transparent resize-none focus:outline-none text-slate-300 placeholder-slate-600 font-mono text-sm leading-relaxed"
                    placeholder="Enter your text here to analyze or humanize..."
                    value={inputText}
                    onChange={handleTextChange}
                    maxLength={MAX_CHAR_LIMIT}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <FileUploader onTextExtracted={handleFileExtracted} />
                    {fileName && (
                      <div className="mt-6 w-full bg-slate-900/50 rounded-lg p-4 border border-slate-700 flex items-center gap-3">
                        <FileText className="text-indigo-400 w-5 h-5" />
                        <span className="text-sm text-slate-200 truncate flex-1">{fileName}</span>
                        <button 
                          onClick={() => { setInputText(''); setFileName(null); }}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Eraser className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {fileName && (
                       <div className="mt-4 w-full h-40 bg-dark-900/30 rounded-lg border border-slate-800 p-3 overflow-y-auto">
                          <p className="text-xs text-slate-500 font-mono whitespace-pre-wrap">
                            {inputText.slice(0, 500)}...
                          </p>
                       </div>
                    )}
                  </div>
                )}
                
                {/* Footer of Input Card */}
                <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                   <span>{inputText.length} / {MAX_CHAR_LIMIT} chars</span>
                   {fileName && <span className="text-indigo-400">File Loaded</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleAnalyze} 
                isLoading={analysis.isAnalyzing}
                disabled={!inputText}
                className="w-full py-4 text-lg"
              >
                <ShieldCheck className="w-5 h-5 mr-2" />
                Analyze Probability
              </Button>
              <Button 
                onClick={handleHumanize} 
                variant="secondary"
                isLoading={humanization.isHumanizing}
                disabled={!inputText}
                className="w-full py-4 text-lg"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Humanize Text
              </Button>
            </div>
          </section>

          {/* Right Column: Results */}
          <section className="flex flex-col gap-6">
             <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">Results</h2>
              <p className="text-slate-400 text-sm">View analysis reports and humanized output.</p>
            </div>
            
            <div className="space-y-6">
              {/* Detection Result */}
              <div className={`
                bg-dark-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden transition-all duration-500
                ${analysis.result ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}
              `}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      AI Detection Report
                    </h3>
                    {analysis.result && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${analysis.result.percentage > 50 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {analysis.result.percentage > 50 ? 'HIGH PROBABILITY' : 'LOW PROBABILITY'}
                      </span>
                    )}
                  </div>

                  {analysis.error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-300 text-sm">
                      {analysis.error}
                    </div>
                  )}

                  {!analysis.result && !analysis.error && !analysis.isAnalyzing && (
                    <div className="h-64 flex items-center justify-center text-slate-500 text-sm italic">
                      Run analysis to see detection results
                    </div>
                  )}

                  {analysis.result && (
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      <div className="h-48">
                         <DetectionGauge percentage={analysis.result.percentage} />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Analysis</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                          {analysis.result.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Humanization Result */}
              <div className={`
                bg-dark-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden transition-all duration-500 flex flex-col
                ${humanization.result ? 'opacity-100 translate-y-0' : 'opacity-90'}
              `}>
                 <div className="p-4 border-b border-slate-700 bg-dark-900/50 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      Humanized Output
                    </h3>
                    {humanization.result && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(humanization.result || '')}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                 </div>

                 <div className="p-6 relative min-h-[300px] bg-dark-800/50">
                    {humanization.isHumanizing && (
                      <div className="absolute inset-0 z-10 bg-dark-800/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                           <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                           <span className="text-purple-300 font-medium animate-pulse">Rewriting content...</span>
                        </div>
                      </div>
                    )}

                    {humanization.error && (
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg text-red-300 text-sm">
                        {humanization.error}
                      </div>
                    )}

                    {!humanization.result && !humanization.isHumanizing && !humanization.error && (
                       <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-60">
                          <Wand2 className="w-12 h-12" />
                          <p className="text-sm italic">Generate a human-like version of your text here.</p>
                       </div>
                    )}

                    {humanization.result && (
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                          {humanization.result}
                        </p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};

export default App;