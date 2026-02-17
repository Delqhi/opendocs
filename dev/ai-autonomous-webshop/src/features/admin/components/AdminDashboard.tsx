import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Users, ShoppingCart, Plus, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { TrendSuggestions } from './TrendSuggestions';
import { aiService } from '../services/aiService';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Revenue', value: '$12,450', icon: LayoutDashboard, color: 'text-green-400' },
    { label: 'Active Orders', value: '48', icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Total Products', value: '156', icon: Package, color: 'text-purple-400' },
    { label: 'Customers', value: '1,204', icon: Users, color: 'text-orange-400' },
  ];

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIDesc = async () => {
    setIsGenerating(true);
    try {
      const desc = await aiService.generateDescription("Nexus Elite Watch", "Electronics");
      alert("AI Generated Description: " + desc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold">Admin Command Center</h1>
          <p className="text-gray-500 mt-1">Real-time autonomous shop monitoring</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleAIDesc} isLoading={isGenerating}>
            <Sparkles size={18} className="mr-2" />
            AI Gen Desc
          </Button>
          <Button>
            <Plus size={18} className="mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl"
          >
            <div className={`p-3 rounded-2xl bg-white/5 w-fit mb-4 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="mb-12">
        <TrendSuggestions />
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex gap-8">
          <button className="text-blue-400 font-medium pb-4 border-b-2 border-blue-400">Recent Orders</button>
          <button className="text-gray-500 hover:text-white transition-colors pb-4">Product Inventory</button>
          <button className="text-gray-500 hover:text-white transition-colors pb-4">AI Logs</button>
        </div>
        <div className="p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-sm uppercase tracking-wider">
                <th className="pb-4 font-medium">Order ID</th>
                <th className="pb-4 font-medium">Customer</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-colors">
                  <td className="py-4 font-mono text-sm">#ORD-2026-{1000 + i}</td>
                  <td className="py-4">User {i + 1}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                      Processing
                    </span>
                  </td>
                  <td className="py-4 font-bold">$129.00</td>
                  <td className="py-4 text-right">
                    <button className="text-gray-500 hover:text-white transition-colors text-sm">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
