import React, { useState, useRef, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { WinnerModal } from './components/WinnerModal';
import { AppState, Winner } from './types';
import { Trash2, Users, RotateCcw, Play, Zap, Download, History, LayoutGrid } from 'lucide-react';
import { generateCongratulatoryMessage } from './services/geminiService';

const App: React.FC = () => {
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [drawnNames, setDrawnNames] = useState<Winner[]>([]);
  const [currentState, setCurrentState] = useState<AppState>(AppState.IDLE);
  const [currentDisplay, setCurrentDisplay] = useState<string>("幸运抽奖");
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileLoaded = (names: string[]) => {
    setRemainingNames(names);
    setDrawnNames([]);
    setCurrentState(AppState.IDLE);
    setCurrentDisplay("准备就绪！");
  };

  const startDraw = () => {
    if (remainingNames.length === 0) return;
    setCurrentState(AppState.ROLLING);
    
    let speed = 50;
    
    // Visual rolling effect
    intervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * remainingNames.length);
      setCurrentDisplay(remainingNames[randomIndex]);
    }, speed);

    // Stop after random time between 2s and 3s
    const stopTime = 2000 + Math.random() * 1000;
    
    setTimeout(() => {
        finalizeDraw();
    }, stopTime);
  };

  const finalizeDraw = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Pick actual winner
    const winningIndex = Math.floor(Math.random() * remainingNames.length);
    const winnerName = remainingNames[winningIndex];
    const winnerId = Math.random().toString(36).substring(2, 9);
    
    const winnerObj: Winner = {
      id: winnerId,
      name: winnerName,
      timestamp: Date.now(),
    };

    setCurrentDisplay(winnerName);
    setCurrentState(AppState.WINNER);
    setCurrentWinner(winnerObj);
    
    // Update lists - Remove from remaining, Add to drawn
    const newRemaining = [...remainingNames];
    newRemaining.splice(winningIndex, 1);
    setRemainingNames(newRemaining);
    
    setDrawnNames(prev => [winnerObj, ...prev]);

    // Fetch AI Message
    setIsGeneratingMessage(true);
    const message = await generateCongratulatoryMessage(winnerName);
    setIsGeneratingMessage(false);

    // Update winner with message
    setCurrentWinner(prev => prev ? { ...prev, aiMessage: message } : null);
    setDrawnNames(prev => prev.map(w => w.id === winnerId ? { ...w, aiMessage: message } : w));

  }, [remainingNames]);

  const resetAll = () => {
    if(confirm("确定要重置吗？所有历史记录都将丢失，名单将恢复到初始状态。")) {
       const allNames = [...remainingNames, ...drawnNames.map(w => w.name)].sort();
       setRemainingNames(allNames);
       setDrawnNames([]);
       setCurrentState(AppState.IDLE);
       setCurrentDisplay("准备就绪");
    }
  };

  const exportResults = () => {
    if (drawnNames.length === 0) return;
    // Add BOM for Excel correct encoding
    const csvContent = "\uFEFF" 
      + "姓名,中奖时间,祝福语\n" 
      + drawnNames.map(w => `${w.name},${new Date(w.timestamp).toLocaleString()},"${(w.aiMessage || '').replace(/"/g, '""')}"`).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `中奖名单_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setCurrentWinner(null);
    setCurrentState(AppState.IDLE);
    setCurrentDisplay(remainingNames.length > 0 ? "点击开始" : "已结束");
  };

  // Render Loading Screen if no names
  if (remainingNames.length === 0 && drawnNames.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-full bg-white shadow-xl mb-6">
            <Zap className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">
            Lucky<span className="text-indigo-600">Pick</span>
          </h1>
          <p className="text-slate-600 text-lg">您的活动必备：智能随机姓名抽取工具。</p>
        </div>
        <FileUpload onFileLoaded={handleFileLoaded} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex overflow-hidden font-sans">
      {/* Main Center Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0">
         
         {/* Top Header Bar */}
         <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
            <div className="flex items-center space-x-3">
               <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-md">
                  <Zap className="w-5 h-5 text-white" />
               </div>
               <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">LuckyPick</h1>
            </div>
            
            <div className="flex items-center space-x-4">
               <div className="flex items-center px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                  <Users className="w-4 h-4 text-slate-500 mr-2" />
                  <span className="text-sm font-semibold text-slate-600">
                     奖池: <span className="text-indigo-600 font-bold">{remainingNames.length}</span>
                  </span>
               </div>
               <button 
                  onClick={resetAll}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="重置所有"
               >
                  <RotateCcw className="w-5 h-5" />
               </button>
            </div>
         </div>

         {/* Content Area - Fixed height with internal scrolling/flex */}
         <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
            
            {/* Upper: Rolling Stage (Flex Grow to take attention) */}
            <div className="flex-[3] min-h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 group-hover:scale-105 transition-transform duration-1000"></div>
                
                {/* Rolling Text */}
                <div className={`
                    relative z-10 w-full text-center px-4 transition-all duration-300
                    ${currentState === AppState.ROLLING ? 'scale-110' : ''}
                `}>
                     <h1 className={`
                        font-black break-words leading-tight
                        ${currentState === AppState.ROLLING 
                            ? 'text-6xl md:text-8xl text-slate-300 blur-[2px]' 
                            : 'text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600'}
                     `}>
                        {currentDisplay}
                     </h1>
                </div>

                {/* Main Action Button */}
                <div className="mt-12 relative z-20">
                    {currentState === AppState.IDLE && remainingNames.length === 0 ? (
                        <div className="text-center">
                            <p className="text-slate-400 mb-4 font-medium">所有名字已抽取完毕</p>
                            <button onClick={resetAll} className="px-8 py-3 bg-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-300 transition-colors">
                                重新开始
                            </button>
                        </div>
                    ) : (
                        <button
                        onClick={startDraw}
                        disabled={currentState === AppState.ROLLING}
                        className={`
                            group relative flex items-center px-12 py-5 text-xl font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95
                            ${currentState === AppState.ROLLING 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-500/30'}
                        `}
                        >
                        {currentState === AppState.ROLLING ? (
                            <span className="flex items-center"><span className="animate-pulse mr-2">●</span> 抽取中...</span>
                        ) : (
                            <>
                            <Play className="w-6 h-6 mr-3 fill-current" />
                            {remainingNames.length > 0 ? '开始抽取' : '已结束'}
                            </>
                        )}
                        </button>
                    )}
                </div>
            </div>

            {/* Lower: Remaining Names Grid (Fixed height/scrollable) */}
            <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
               <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex items-center justify-between shrink-0">
                  <h3 className="font-bold text-slate-700 flex items-center">
                     <LayoutGrid className="w-4 h-4 mr-2 text-indigo-500" /> 
                     待抽名单 
                  </h3>
                  <span className="text-xs bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded font-mono">
                      {remainingNames.length} LEFT
                  </span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/30">
                  {remainingNames.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                          <p>名单为空</p>
                      </div>
                  ) : (
                      // Grid 5 columns as requested
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {remainingNames.map((name, idx) => (
                               <div key={idx} className="px-3 py-2 text-center text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm transition-all truncate select-none cursor-default" title={name}>
                                  {name}
                               </div>
                          ))}
                      </div>
                  )}
               </div>
            </div>

         </div>
      </div>

      {/* Right Sidebar: History */}
      <div className="hidden xl:flex w-80 bg-white border-l border-slate-200 flex-col z-10 shadow-sm shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-slate-700">
              <History className="w-5 h-5 mr-2" />
              <h3 className="font-bold">中奖记录</h3>
            </div>
            <button 
              onClick={exportResults} 
              disabled={drawnNames.length === 0}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              title="导出 CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
           <div className="flex items-baseline">
             <p className="text-4xl font-black text-pink-600">{drawnNames.length}</p>
             <p className="text-xs text-slate-400 ml-2">人已中奖</p>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {drawnNames.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50">
              <Trash2 className="w-12 h-12" />
              <p className="text-sm">暂无中奖者</p>
            </div>
          )}
          {drawnNames.map((winner, i) => (
            <div key={winner.id} className="relative p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
              <div className="absolute -left-1 top-4 w-1 h-8 bg-indigo-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-slate-800 text-lg">{winner.name}</span>
                 <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                   #{drawnNames.length - i}
                 </span>
              </div>
              <div className="text-xs text-slate-400 mb-2 flex items-center">
                 {new Date(winner.timestamp).toLocaleTimeString()}
              </div>
              {winner.aiMessage && (
                <div className="relative mt-2 pl-3 border-l-2 border-pink-200">
                  <p className="text-xs text-indigo-600 italic leading-relaxed">
                    "{winner.aiMessage}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {drawnNames.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <button 
              onClick={exportResults}
              className="w-full py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              下载中奖名单
            </button>
          </div>
        )}
      </div>

      <WinnerModal 
        winner={currentWinner} 
        onClose={handleCloseModal}
        isGeneratingMessage={isGeneratingMessage} 
      />
    </div>
  );
};

export default App;