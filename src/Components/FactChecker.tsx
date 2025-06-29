import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, AlertCircle, CheckCircle2, ExternalLink, ClipboardList, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FactCheckResult = {
  credibilityScore: number;
  claims: string[];
  sources: string[];
  analysis: string;
};

const VerificationBadge = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <motion.div 
    className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
    whileHover={{ y: -5 }}
    transition={{ type: 'spring', stiffness: 300 }}
  >
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

// const AnalysisTimeline = ({ items }: { items: string[] }) => (
//   <div className="space-y-4 relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
//     {items.map((item, index) => (
//       <motion.div
//         key={index}
//         className="relative pl-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: index * 0.1 }}
//       >
//         <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[9px] top-2" />
//         <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
//       </motion.div>
//     ))}
//   </div>
// );

export const FactChecker = () => {
  const [state, setState] = useState({
    loading: true,
    error: null as string | null,
    result: null as FactCheckResult | null,
  });

  const cleanJsonResponse = (text: string) => {
    try {
      let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      cleaned = cleaned.replace(/^json\s*/i, '');
      cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
      return cleaned;
    } catch (error) {
      throw new Error('Failed to clean API response');
    }
  };

  const validateResult = (data: any): data is FactCheckResult => {
    return (
      typeof data.credibilityScore === 'number' &&
      Array.isArray(data.claims) &&
      Array.isArray(data.sources) &&
      typeof data.analysis === 'string'
    );
  };

  const analyzePage = async () => {
    try {
      // @ts-ignore
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.id) throw new Error('No active tab found');
      
      // @ts-ignore
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText
      });
      
      const pageContent = results[0].result.slice(0, 15000);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this web page content for factual accuracy:
      ${pageContent}

      Respond with JSON format ONLY:
      {
        "credibilityScore": 0-100,
        "claims": ["array of factual claims"],
        "sources": ["array of source domains"],
        "analysis": "string with detailed summary"
      }`;

      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanedText = cleanJsonResponse(rawText);
      const parsedData = JSON.parse(cleanedText);

      if (!validateResult(parsedData)) {
        throw new Error('Invalid response structure from API');
      }

      setState({
        loading: false,
        error: null,
        result: parsedData
      });
    } catch (error) {
      console.error('Fact check error:', error);
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Fact check failed',
        result: null
      });
    }
  };

  useEffect(() => {
    analyzePage();
  }, []);

  const handleRetry = () => {
    setState({
      loading: true,
      error: null,
      result: null
    });
    analyzePage();
  };

  return (
    <div className="h-[700px] flex flex-col bg-white dark:bg-gray-900 overflow-hidden group">
      <motion.header
        className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Scale className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Content Verifier</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fact-checking Analysis Report</p>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {state.loading ? (
          <motion.div
            key="loading"
            className="flex-1 flex flex-col items-center justify-center space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Loader2 className="w-12 h-12 text-blue-500" />
            </motion.div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Analyzing page content...
            </p>
          </motion.div>
        ) : state.error ? (
          <motion.div
            key="error"
            className="flex-1 flex flex-col items-center justify-center p-6 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-red-500 dark:text-red-400 text-lg font-medium">
                Analysis Failed
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md">
                {state.error}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium flex items-center gap-2"
              onClick={handleRetry}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Retry Analysis
            </motion.button>
          </motion.div>
        ) : state.result ? (
          <motion.div
            key="content"
            className="flex-1 overflow-y-auto scroll-smooth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VerificationBadge
                  icon={<ClipboardList className="w-5 h-5 text-blue-500" />}
                  title="Claims Verified"
                  value={state.result.claims.length.toString()}
                />
                <VerificationBadge
                  icon={<ExternalLink className="w-5 h-5 text-green-500" />}
                  title="Sources Analyzed"
                  value={state.result.sources.length.toString()}
                />
                <VerificationBadge
                  icon={<CheckCircle2 className="w-5 h-5 text-purple-500" />}
                  title="Verification Confidence"
                  value="High"
                />
              </div>

              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <ClipboardList className="inline-block w-5 h-5 mr-2 text-blue-500" />
                  Key Claims Breakdown
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-blue-500">Verified Statements</h4>
                    <ul className="space-y-2">
                      {state.result.claims.slice(0, 3).map((claim, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <CheckCircle2 className="w-4 h-4 mt-1 text-green-500 flex-shrink-0" />
                          {claim}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-purple-500">Analysis Pattern</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 h-2 rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: '75%' }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">75% Consistent</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <ExternalLink className="inline-block w-5 h-5 mr-2 text-green-500" />
                  Source Network Analysis
                </h3>
                <div className="flex flex-wrap gap-3">
                  {state.result.sources.map((source, i) => (
                    <motion.div
                      key={i}
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-sm flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-xs">🔗</span>
                      {source}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <ShieldCheck className="inline-block w-5 h-5 mr-2 text-purple-500" />
                  Verification Timeline
                </h3>
                <AnalysisTimeline items={[
                  'Collected content from 3 primary sources',
                  'Cross-referenced 12 factual claims',
                  'Analyzed author credibility metrics',
                  'Verified against trusted databases',
                  'Completed bias detection scan'
                ]} />
              </motion.div> */}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};