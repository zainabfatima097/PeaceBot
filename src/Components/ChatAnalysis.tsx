import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2, HeartHandshake, BarChart4, Leaf, Sparkles, Shield, TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

type PeaceImpact = {
  peaceScore: number;
  conflictResolutionPotential: number;
  impactAreas: {
    diplomacy: number;
    humanitarian: number;
    education: number;
    economic: number;
  };
  projectedOutcomes: string[];
  visualizationPrompt: string;
};

type AnalysisResult = {
  conflictDetected: boolean;
  peaceImpact: PeaceImpact;
  keyOpportunities: string[];
  summary: string;
};

type PageContent = {
  title: string;
  content: string;
  url: string;
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'demo-key');

const PeaceRadialChart = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
        />
        <motion.circle
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          transform="rotate(-90 80 80)"
        />
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
        >
          <circle cx="80" cy="80" r="40" fill="#0f172a" />
          <Leaf className="w-8 h-8 text-green-400 mx-auto" x="72" y="72" />
        </motion.g>
        
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-sm text-gray-400">PEACE SCORE</span>
      </motion.div>
    </div>
  );
};

const ImpactDimensionCard = ({ 
  icon, 
  title, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: number; 
  color: string;
}) => (
  <motion.div 
    className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-xl"
    whileHover={{ y: -5 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1" style={{ color }}>{value}/10</p>
      </div>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2">
      <motion.div 
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value * 10}%` }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  </motion.div>
);

export const PeaceImpactAnalysis = () => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    analysis: AnalysisResult | null;
    pageContent: PageContent | null;
  }>({
    loading: true,
    error: null,
    analysis: null,
    pageContent: null
  });

  const fetchPageContent = async (): Promise<PageContent> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout - page content fetch took too long'));
      }, 10000);

      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          { action: "getPageContent" },
          (response: PageContent | { error: string }) => {
            clearTimeout(timeout);
            //@ts-ignore
            if (chrome.runtime.lastError) {
              //@ts-ignore
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (!response || 'error' in response) {
              reject(new Error(response?.error || 'No response received'));
              return;
            }
            
            resolve(response as PageContent);
          }
        );
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Message sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  };

  const analyzeContent = async (content: string): Promise<AnalysisResult> => {
    try {
      // Demo mode handling
      if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'demo-key') {
        return {
          conflictDetected: Math.random() > 0.5,
          peaceImpact: {
            peaceScore: Math.floor(Math.random() * 40) + 60,
            conflictResolutionPotential: Math.floor(Math.random() * 7) + 3,
            impactAreas: {
              diplomacy: Math.floor(Math.random() * 8) + 2,
              humanitarian: Math.floor(Math.random() * 8) + 2,
              education: Math.floor(Math.random() * 8) + 2,
              economic: Math.floor(Math.random() * 8) + 2
            },
            projectedOutcomes: [
              'Potential to reduce violence by 35% in affected regions',
              'Could foster diplomatic relations between conflicting parties',
              'May create economic opportunities for 50,000 people'
            ],
            visualizationPrompt: 'A vibrant tree growing from a cracked battlefield with diverse hands watering it'
          },
          keyOpportunities: [
            'Mention of community dialogue programs',
            'References to economic development initiatives',
            'Educational exchange proposals'
          ],
          summary: 'This content shows strong potential for peace-building through multiple approaches.'
        };
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Perform a comprehensive peace impact analysis of this content:

      Content:
      ${content.slice(0, 15000)}
      
      Respond with JSON in this exact structure:
      {
        "conflictDetected": boolean,
        "peaceImpact": {
          "peaceScore": number_0_to_100,
          "conflictResolutionPotential": number_1_to_10,
          "impactAreas": {
            "diplomacy": number_1_to_10,
            "humanitarian": number_1_to_10,
            "education": number_1_to_10,
            "economic": number_1_to_10
          },
          "projectedOutcomes": ["outcome1", "outcome2", "outcome3"],
          "visualizationPrompt": "description_for_peace_visualization_image"
        },
        "keyOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
        "summary": "brief_summary_of_peace_impact"
      }
      
      Analysis should focus on:
      - Potential for conflict resolution and peace-building
      - Impact across diplomatic, humanitarian, educational, and economic dimensions
      - Visual metaphor representing the peace-building potential
      - Actionable opportunities for peace enhancement`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const cleanedResponse = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();
      
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const retryAnalysis = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  useEffect(() => {
    const processAnalysis = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const pageContent = await fetchPageContent();
        if (!pageContent.content || pageContent.content.trim().length < 10) {
          throw new Error('Page content is too short for meaningful analysis');
        }

        const analysis = await analyzeContent(pageContent.content);
        
        setState({
          loading: false,
          error: null,
          analysis,
          pageContent
        });
        
      } catch (error) {
        setState({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          analysis: null,
          pageContent: null
        });
      }
    };

    processAnalysis();
  }, []);

  return (
    <div className="h-[600px] flex flex-col bg-gradient-to-br from-slate-900 to-slate-950 overflow-hidden p-5 relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-900/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <motion.div 
        className="flex items-center gap-4 mb-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-slate-700 backdrop-blur-sm">
          <HeartHandshake className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Peace Impact Analysis
          </h1>
          <p className="text-sm text-slate-500">Real-time peace-building potential assessment</p>
        </div>
      </motion.div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto z-10">
        {state.loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse blur-md"></div>
                <Loader2 className="w-12 h-12 text-blue-500 relative" />
              </div>
            </motion.div>
            <motion.p 
              className="mt-4 text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Analyzing peace-building potential...
            </motion.p>
          </div>
        ) : state.error ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <motion.div
              className="p-4 bg-gradient-to-br from-red-900/20 to-transparent rounded-full border border-red-500/30"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <Shield className="w-12 h-12 text-red-400" />
            </motion.div>
            <motion.p 
              className="text-red-400 mt-6 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {state.error}
            </motion.p>
            <motion.button
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retryAnalysis}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Retry Analysis
            </motion.button>
          </div>
        ) : state.analysis ? (
          <div className="space-y-8 pb-4">
            {/* Peace Score Radial Chart */}
            <motion.div 
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-3xl border border-slate-700 backdrop-blur-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-center">
                <h2 className="text-lg font-semibold text-slate-300 mb-2">Peace Impact Score</h2>
                <p className="text-sm text-slate-500 mb-6">
                  {state.analysis.peaceImpact.peaceScore > 70 
                    ? "High peace-building potential" 
                    : state.analysis.peaceImpact.peaceScore > 40 
                      ? "Moderate peace opportunities" 
                      : "Limited peace impact detected"}
                </p>
                <PeaceRadialChart score={state.analysis.peaceImpact.peaceScore} />
                <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">Resolution Potential</p>
                    <p className="text-xl font-bold text-blue-400">
                      {state.analysis.peaceImpact.conflictResolutionPotential}/10
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400">Content Credibility</p>
                    <p className="text-xl font-bold text-purple-400">
                      {Math.floor(state.analysis.peaceImpact.peaceScore / 10)}/10
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Impact Dimensions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-md font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <BarChart4 className="w-5 h-5 text-purple-400" />
                Impact Dimensions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <ImpactDimensionCard 
                  icon={<TrendingUp className="w-5 h-5 text-blue-400" />} 
                  title="Diplomacy" 
                  value={state.analysis.peaceImpact.impactAreas.diplomacy} 
                  color="#3b82f6" 
                />
                <ImpactDimensionCard 
                  icon={<Users className="w-5 h-5 text-green-400" />} 
                  title="Humanitarian" 
                  value={state.analysis.peaceImpact.impactAreas.humanitarian} 
                  color="#10b981" 
                />
                <ImpactDimensionCard 
                  icon={<BookOpen className="w-5 h-5 text-purple-400" />} 
                  title="Education" 
                  value={state.analysis.peaceImpact.impactAreas.education} 
                  color="#8b5cf6" 
                />
                <ImpactDimensionCard 
                  icon={<DollarSign className="w-5 h-5 text-yellow-400" />} 
                  title="Economic" 
                  value={state.analysis.peaceImpact.impactAreas.economic} 
                  color="#f59e0b" 
                />
              </div>
            </motion.div>

            {/* Projected Outcomes */}
            {state.analysis.peaceImpact.projectedOutcomes.length > 0 && (
              <motion.div
                className="bg-gradient-to-br from-green-900/20 to-teal-900/20 p-5 rounded-2xl border border-green-800/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-md font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Projected Peace Outcomes
                </h3>
                <ul className="space-y-3">
                  {state.analysis.peaceImpact.projectedOutcomes.map((outcome, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-start gap-3 pl-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div className="mt-2 w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <p className="text-slate-300 text-sm">{outcome}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Key Opportunities */}
            {state.analysis.keyOpportunities.length > 0 && (
              <motion.div
                className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-5 rounded-2xl border border-blue-800/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-md font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-400" />
                  Key Peace Opportunities
                </h3>
                <div className="space-y-3">
                  {state.analysis.keyOpportunities.map((opportunity, i) => (
                    <motion.div 
                      key={i} 
                      className="p-3 bg-slate-800/30 rounded-lg border border-slate-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <p className="text-slate-300 text-sm">{opportunity}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Summary */}
            <motion.div
              className="p-5 bg-slate-800/20 rounded-2xl border border-slate-700 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <h3 className="text-md font-semibold text-slate-300 mb-3">Analysis Summary</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {state.analysis.summary}
              </p>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
};