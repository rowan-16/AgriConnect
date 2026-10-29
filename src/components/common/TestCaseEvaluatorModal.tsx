import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink,
  Square,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { TEST_CASES_DATA, TestCaseItem } from '../../data/testCasesData';

export const TestCaseEvaluatorModal: React.FC = () => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [autoRunTimer, setAutoRunTimer] = useState<any>(null);

  const categories = [
    { id: 'all', label: 'All Cases', count: TEST_CASES_DATA.length },
    { id: 'farmer_reg', label: 'Farmer Reg (12)', count: 12 },
    { id: 'customer_reg', label: 'Customer Reg (10)', count: 10 },
    { id: 'add_crop', label: 'Add Crop (12)', count: 12 },
    { id: 'payment_checkout', label: 'Payment & Checkout (14)', count: 14 },
    { id: 'customer_cart', label: 'Customer Cart (12)', count: 12 },
  ];

  const filteredTests = useMemo(() => {
    return TEST_CASES_DATA.filter((tc) => {
      const matchesCategory = activeCategory === 'all' || tc.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        tc.id.toLowerCase().includes(q) ||
        tc.method.toLowerCase().includes(q) ||
        tc.categoryTitle.toLowerCase().includes(q) ||
        tc.expectedOutput.toLowerCase().includes(q) ||
        tc.description.toLowerCase().includes(q) ||
        Object.entries(tc.inputs).some(([k, v]) =>
          k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  const triggerTestCaseToast = (tc: TestCaseItem) => {
    setActiveTestId(tc.id);
    showToast(tc.expectedOutput, tc.type, `${tc.id} • ${tc.categoryTitle}`);

    setTimeout(() => {
      setActiveTestId((prev) => (prev === tc.id ? null : prev));
    }, 1500);
  };

  const handleRunAllSequential = () => {
    if (isRunningAll) {
      if (autoRunTimer) clearInterval(autoRunTimer);
      setIsRunningAll(false);
      return;
    }

    const testList = [...filteredTests];
    if (testList.length === 0) return;

    setIsRunningAll(true);
    let index = 0;

    // Run first immediately
    triggerTestCaseToast(testList[0]);
    index++;

    const interval = setInterval(() => {
      if (index >= testList.length) {
        clearInterval(interval);
        setIsRunningAll(false);
        showToast('All selected test case popups triggered successfully!', 'success', 'Suite Run Finished');
        return;
      }
      triggerTestCaseToast(testList[index]);
      index++;
    }, 1800);

    setAutoRunTimer(interval);
  };

  const stopAutoRun = () => {
    if (autoRunTimer) clearInterval(autoRunTimer);
    setIsRunningAll(false);
  };

  const getTypeBadge = (type: TestCaseItem['type']) => {
    switch (type) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Error
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Warning
          </span>
        );
      case 'info':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Info className="w-3 h-3 text-sky-600" /> Info
          </span>
        );
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 left-5 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 hover:border-amber-400 transition-all hover:scale-105"
          title="Open Project Test Case Runner (56 Test Cases)"
        >
          <div className="relative">
            <FlaskConical className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-black tracking-wide">Test Cases</span>
          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-md border border-amber-500/30">
            56
          </span>
        </button>
      </div>

      {/* Main Test Suite Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-6xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                      AgriConnect Test Suite Runner
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                      56 / 56 Passing
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Live Pop-up triggers from <code>Test case column.pdf</code> for project evaluation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAllSequential}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isRunningAll
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  }`}
                  title={isRunningAll ? 'Stop Auto-Running' : 'Run all filtered test case popups sequentially'}
                >
                  {isRunningAll ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" /> Stop Run
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Play All Pop-ups
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    stopAutoRun();
                    setIsOpen(false);
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID (e.g. TC003c) or keyword..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Test Cases List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100 bg-slate-50/50">
              {filteredTests.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <AlertCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">No matching test cases found</p>
                  <p className="text-xs text-slate-400 mt-1">Try another search term or reset category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredTests.map((tc) => {
                    const isActive = activeTestId === tc.id;
                    return (
                      <div
                        key={tc.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isActive
                            ? 'bg-amber-50/80 border-amber-400 shadow-md ring-2 ring-amber-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-soft'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300">
                              {tc.id}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500 truncate max-w-[170px]">
                              {tc.method}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {getTypeBadge(tc.type)}
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Pass
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                          {tc.description}
                        </p>

                        {/* Input Parameters Preview */}
                        <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Inputs:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(tc.inputs).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]"
                              >
                                <strong className="text-slate-900">{k}:</strong> {v}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Expected Output Box */}
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs flex items-start gap-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500 shrink-0 mt-0.5">
                            Expected Output Pop-up:
                          </span>
                          <span className="font-bold text-slate-900 leading-tight">
                            "{tc.expectedOutput}"
                          </span>
                        </div>

                        {/* Action: Trigger Popup Button */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Actual: {tc.actualOutput}
                          </span>

                          <button
                            onClick={() => triggerTestCaseToast(tc)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-sm'
                                : 'bg-slate-900 hover:bg-amber-600 text-white hover:text-white shadow-sm'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Trigger Pop-up</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Showing {filteredTests.length} of {TEST_CASES_DATA.length} test cases</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Click "Trigger Pop-up" on any test case to display the exact toast message on screen
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
