// Layout.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ChatBot } from './ChatBot';
import { FactChecker } from './FactChecker';
import { PeaceImpactAnalysis } from './ChatAnalysis';
import { ConflictSummaries } from './ConflictSummariser';

export const Layout = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'conflicts' | 'factcheck' | 'profile' | 'docs'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-[600px] w-[400px] bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] overflow-hidden relative">
      <motion.div
        className={`${sidebarOpen ? 'w-14' : 'w-0'} transition-all duration-300`}
        animate={{ width: sidebarOpen ? 56 : 0 }}
      >
        <Sidebar 
          activeTab={activeTab}
          //@ts-ignore
          onTabChange={setActiveTab}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </motion.div>

      <motion.main 
        className="flex-1 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === 'chat' ? (
          <ChatBot />
        ) : activeTab === 'conflicts' ? (
          <ConflictSummaries />
        ) : activeTab === 'factcheck' ? (
          <FactChecker />
        ) : activeTab === 'profile' ? (
          <PeaceImpactAnalysis />
        ) : activeTab === 'docs' ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-sm">To Be Implemented</p>
          </div>
        ) : null}
      </motion.main>
    </div>
  );
};