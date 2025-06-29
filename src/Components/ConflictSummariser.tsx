import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock, BarChart, Loader2, X, Map, Globe } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY2 || '');

type ConflictStats = {
  activeConflicts: number;
  resolutions: number;
  avgResolutionTime: string;
  trends: {
    active: { value: string; direction: 'up' | 'down' };
    resolutions: { value: string; direction: 'up' | 'down' };
    resolutionTime: { value: string; direction: 'up' | 'down' };
  };
  activeConflictList: string[];
  resolvedConflictList: string[];
};

const StatsCard = ({ 
  icon, 
  title, 
  value, 
  trend,
  onClick
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number;
  trend: any;
  onClick: () => void;
}) => (
  <motion.div 
    className="bg-gradient-to-br from-[#101010] to-[#1a1a1a] p-5 rounded-2xl border border-white/10 shadow-2xl cursor-pointer group overflow-hidden relative"
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Animated background effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute w-64 h-64 -top-32 -right-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
    </div>
    
    <div className="flex items-start gap-4 relative z-10">
      <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-white/10">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-1">{value}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-sm mt-4 relative z-10">
      <span className={`px-2 py-1 rounded-full text-xs ${trend.direction === 'up' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
        <trend.icon className={`w-3 h-3 inline-block mr-1 ${trend.color}`} />
        {trend.value}
      </span>
    </div>
  </motion.div>
);

const ConflictListModal = ({ 
  title, 
  items, 
  onClose 
}: { 
  title: string; 
  items: string[]; 
  onClose: () => void 
}) => (
  <motion.div
    className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-gradient-to-br from-[#0a0a0a] to-[#161616] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[85vh] flex flex-col"
      initial={{ scale: 0.9, y: 40 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 40 }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
      <div className="absolute top-4 left-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
      
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">Detailed conflict analysis</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <ul className="space-y-4 p-6">
          {items.map((item, index) => (
            <motion.li
              key={index}
              className="p-4 bg-gradient-to-b from-[#1a1a1a] to-[#101010] rounded-xl border border-white/5 hover:border-blue-500/30 transition-all group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex-shrink-0"></div>
                <div>
                  <p className="text-gray-200 group-hover:text-white transition-colors">{item.split(':')[0]}</p>
                  <p className="text-sm text-gray-400 mt-1">{item.split(':').slice(1).join(':')}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 border-t border-white/10 flex justify-center">
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-medium shadow-lg transition-all"
        >
          Close Analysis
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const WorldMapVisualization = () => (
  <motion.div 
    className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.4 }}
  >
    {/* Animated world map visualization */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0c1a30] to-[#1a0f30] flex items-center justify-center">
      <Globe className="w-32 h-32 text-blue-500/10" />
      
      {/* Animated conflict points */}
      <motion.div 
        className="absolute w-3 h-3 bg-red-500 rounded-full"
        style={{ top: '30%', left: '45%' }}
        animate={{ 
          scale: [1, 1.5, 1],
          boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 10px rgba(239,68,68,0)']
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeOut"
        }}
      />
      
      <motion.div 
        className="absolute w-3 h-3 bg-red-500 rounded-full"
        style={{ top: '50%', left: '20%' }}
        animate={{ 
          scale: [1, 1.5, 1],
          boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 10px rgba(239,68,68,0)']
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          delay: 0.5,
          ease: "easeOut"
        }}
      />
      
      <motion.div 
        className="absolute w-3 h-3 bg-red-500 rounded-full"
        style={{ top: '40%', left: '70%' }}
        animate={{ 
          scale: [1, 1.5, 1],
          boxShadow: ['0 0 0 0 rgba(239,68,68,0.3)', '0 0 0 10px rgba(239,68,68,0)']
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          delay: 1,
          ease: "easeOut"
        }}
      />
    </div>
    
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="text-center p-6 backdrop-blur-md bg-black/30 rounded-xl border border-white/10">
        <Map className="w-8 h-8 text-blue-400 mx-auto" />
        <h3 className="text-xl font-bold text-white mt-2">Global Conflict Map</h3>
        <p className="text-sm text-gray-300 mt-1">Real-time conflict visualization</p>
      </div>
    </div>
  </motion.div>
);

export const ConflictSummaries = () => {
  const [stats, setStats] = useState<ConflictStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'active' | 'resolved' | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const fetchConflictData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        }
      });
      
      const prompt = `Provide current global conflict statistics in this strict JSON format:
      {
        "activeConflicts": number,
        "resolutions": number,
        "avgResolutionTime": string,
        "trends": {
          "active": { "value": string, "direction": "up"|"down" },
          "resolutions": { "value": string, "direction": "up"|"down" },
          "resolutionTime": { "value": string, "direction": "up"|"down" }
        },
        "activeConflictList": [ // 5-10 current active conflicts
          "Conflict name 1: Location, type, parties involved",
          "Conflict name 2: Location, type, parties involved",
          ...
        ],
        "resolvedConflictList": [ // 5-10 recently resolved conflicts
          "Resolution name 1: Location, parties, resolution method",
          "Resolution name 2: Location, parties, resolution method",
          ...
        ]
      }
      Use real 2024 data from reliable sources. Provide comprehensive lists.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      // Clean the JSON response
      const jsonString = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/^json\s*/i, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/\\n/g, '')
        .trim();
      
      const data = JSON.parse(jsonString);
      
      // Validate response structure
      if (
        typeof data.activeConflicts !== 'number' ||
        typeof data.resolutions !== 'number' ||
        typeof data.avgResolutionTime !== 'string' ||
        !data.trends ||
        !data.trends.active ||
        !data.trends.resolutions ||
        !data.trends.resolutionTime ||
        !Array.isArray(data.activeConflictList) ||
        !Array.isArray(data.resolvedConflictList)
      ) {
        throw new Error('Invalid data format from API');
      }
      
      setStats(data);
    } catch (err: any) {
      console.error('Conflict data fetch error:', err);
      setError(err.message || 'Failed to load conflict data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflictData();
  }, []);

  const getTrendData = (trend: { value: string; direction: 'up' | 'down' }) => ({
    value: `${trend.value} ${trend.direction === 'up' ? 'Increase' : 'Decrease'}`,
    color: trend.direction === 'up' ? 'text-red-400' : 'text-green-400',
    icon: BarChart
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0c0c] to-[#141414]">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse blur-md"></div>
            <Loader2 className="w-16 h-16 text-blue-500 relative" />
          </div>
        </motion.div>
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white">Analyzing Global Conflicts</h3>
          <p className="text-gray-400 mt-2">Processing real-time conflict intelligence</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0c0c0c] to-[#141414] p-6">
        <motion.div
          className="p-5 bg-gradient-to-br from-red-900/20 to-transparent rounded-full border border-red-500/30"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <AlertCircle className="w-16 h-16 text-red-400" />
        </motion.div>
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
          <p className="text-gray-400 mt-2 max-w-md">{error}</p>
        </motion.div>
        <motion.button
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchConflictData}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Retry Analysis
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#141414] overflow-hidden relative">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Scrollable content container */}
      <div 
        ref={contentRef}
        className="relative z-10 h-screen flex flex-col overflow-hidden"
      >
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <motion.header
              className="mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <motion.h1 
                    className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Conflict Intelligence
                  </motion.h1>
                  <motion.p 
                    className="text-gray-400 mt-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Real-time global conflict monitoring & analysis
                  </motion.p>
                </div>
                <motion.div
                  className="p-3 bg-gradient-to-br from-[#1a1a1a] to-[#101010] rounded-xl border border-white/10"
                  initial={{ opacity: 0, rotate: -30 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Globe className="w-6 h-6 text-blue-400" />
                </motion.div>
              </div>
            </motion.header>

            {stats && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <StatsCard
                    icon={<AlertCircle className="w-6 h-6 text-red-400" />}
                    title="Active Conflicts"
                    value={stats.activeConflicts}
                    trend={getTrendData(stats.trends.active)}
                    onClick={() => setActiveModal('active')}
                  />

                  <StatsCard
                    icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
                    title="Resolutions"
                    value={stats.resolutions}
                    trend={getTrendData(stats.trends.resolutions)}
                    onClick={() => setActiveModal('resolved')}
                  />

                  <StatsCard
                    icon={<Clock className="w-6 h-6 text-yellow-400" />}
                    title="Resolution Time"
                    value={stats.avgResolutionTime}
                    trend={getTrendData(stats.trends.resolutionTime)}
                    onClick={() => {}}
                  />
                </div>

                <div className="mb-8">
                  <WorldMapVisualization />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeModal === 'active' && stats?.activeConflictList && (
          <ConflictListModal
            title="Active Global Conflicts"
            items={stats.activeConflictList}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'resolved' && stats?.resolvedConflictList && (
          <ConflictListModal
            title="Recently Resolved Conflicts"
            items={stats.resolvedConflictList}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};