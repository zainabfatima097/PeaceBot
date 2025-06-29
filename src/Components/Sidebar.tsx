// Sidebar.tsx
import { motion } from 'framer-motion';
import { MessageCircle, AlertCircle, ShieldCheck, User, Book, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = ({ 
  activeTab,
  onTabChange,
  onToggleSidebar
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}) => {
  const menuItems = [
    { icon: <MessageCircle size={18} />, label: 'chat' },        // ChatBot
    { icon: <AlertCircle size={18} />, label: 'conflicts' },    // Conflicts
    { icon: <ShieldCheck size={18} />, label: 'factcheck' },    // Fact Checker
    { icon: <User size={18} />, label: 'profile' },
    { icon: <Book size={18} />, label: 'docs' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] flex flex-col items-center py-4 border-r border-white/10 backdrop-blur-lg">
      <button 
        onClick={onToggleSidebar}
        className="mb-6 p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </button>

      <nav className="flex-1 space-y-3 w-full px-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            onClick={() => onTabChange(item.label)}
            className={`relative w-full flex items-center justify-center p-2 rounded-lg transition-colors
              ${activeTab === item.label 
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-inner-glow'
                : 'hover:bg-white/5'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`transition-colors ${activeTab === item.label ? 'text-blue-400' : 'text-gray-400'}`}>
              {item.icon}
            </span>
            
            {activeTab === item.label && (
              <motion.div 
                className="absolute -right-1 w-1 h-6 bg-blue-400 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      <div className="mt-auto w-full px-2">
        <button className="w-full p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-400 mx-auto" />
        </button>
      </div>
    </div>
  );
};