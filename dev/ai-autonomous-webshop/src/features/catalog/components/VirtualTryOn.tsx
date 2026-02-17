import React from 'react';
import { motion } from 'framer-motion';
import { Box, Camera, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const VirtualTryOn: React.FC = () => {
  return (
    <div className="glass p-8 rounded-3xl border border-blue-500/20 overflow-hidden relative group">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/10 blur-3xl rounded-full group-hover:bg-blue-600/20 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">AR Virtual Try-On</h2>
            <p className="text-gray-500 text-sm">Powered by NexusVision™ AR Engine</p>
          </div>
        </div>

        <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-4 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800')] opacity-10 grayscale" />
          <Camera size={48} className="text-gray-700 relative z-10" />
          <p className="text-gray-500 text-sm relative z-10">Camera access required for AR preview</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-blue-400/60 font-mono">
            <Info size={14} />
            <span>RESEARCH PHASE: INTEGRATING WEBAR SDK v4.2</span>
          </div>
          <Button className="w-full" variant="primary">
            Launch AR Experience
          </Button>
        </div>
      </div>
    </div>
  );
};
