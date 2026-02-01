"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { CosmicBackground } from "@/components/CosmicBackground";
import { AdminGuard, LogoutButton } from "@/components/AdminGuard";
import Link from "next/link";

type InventoryType = "hop" | "fermentable" | "yeast" | "misc";

interface InventoryItem {
  _id: Id<"inventory">;
  type: string;
  name: string;
  amount: number;
  unit: string;
  alpha?: number;
  color?: number;
  potential?: number;
  attenuation?: number;
  purchaseDate?: string;
  bestBefore?: string;
  supplier?: string;
}

const TYPE_COLORS = {
  hop: { bg: "bg-green-500/20", border: "border-green-500/50", text: "text-green-400", icon: "🌿" },
  fermentable: { bg: "bg-orange-500/20", border: "border-orange-500/50", text: "text-orange-400", icon: "🌾" },
  yeast: { bg: "bg-purple-500/20", border: "border-purple-500/50", text: "text-purple-400", icon: "🧫" },
  misc: { bg: "bg-zinc-500/20", border: "border-zinc-500/50", text: "text-zinc-400", icon: "📦" },
};

export default function InventoryPage() {
  const inventory = useQuery(api.inventory.list, {});
  const addItem = useMutation(api.inventory.add);
  const updateAmount = useMutation(api.inventory.updateAmount);
  const removeItem = useMutation(api.inventory.remove);
  
  const [activeTab, setActiveTab] = useState<InventoryType | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Id<"inventory"> | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  
  // New item form
  const [newItem, setNewItem] = useState({
    type: "hop" as InventoryType,
    name: "",
    amount: 0,
    unit: "oz",
    alpha: undefined as number | undefined,
    color: undefined as number | undefined,
    potential: undefined as number | undefined,
    attenuation: undefined as number | undefined,
    supplier: "",
  });
  
  const filteredInventory = inventory?.filter(item => 
    activeTab === "all" || item.type === activeTab
  ) || [];
  
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.amount) return;
    
    await addItem({
      type: newItem.type,
      name: newItem.name,
      amount: newItem.amount,
      unit: newItem.unit,
      alpha: newItem.type === "hop" ? newItem.alpha : undefined,
      color: newItem.type === "fermentable" ? newItem.color : undefined,
      potential: newItem.type === "fermentable" ? newItem.potential : undefined,
      attenuation: newItem.type === "yeast" ? newItem.attenuation : undefined,
      supplier: newItem.supplier || undefined,
    });
    
    setNewItem({
      type: "hop",
      name: "",
      amount: 0,
      unit: "oz",
      alpha: undefined,
      color: undefined,
      potential: undefined,
      attenuation: undefined,
      supplier: "",
    });
    setShowAddModal(false);
  };
  
  const handleAdjustAmount = async (id: Id<"inventory">, delta: number) => {
    // Find current item to get its amount
    const item = inventory?.find(i => i._id === id);
    if (!item) return;
    const newAmount = Math.max(0, item.amount + delta);
    await updateAmount({ id, amount: newAmount });
    setEditingItem(null);
    setAdjustAmount("");
  };
  
  const handleRemove = async (id: Id<"inventory">) => {
    if (!confirm("Remove this item from inventory?")) return;
    await removeItem({ id });
  };
  
  // Stats
  const stats = {
    hops: inventory?.filter(i => i.type === "hop").length || 0,
    fermentables: inventory?.filter(i => i.type === "fermentable").length || 0,
    yeast: inventory?.filter(i => i.type === "yeast").length || 0,
    misc: inventory?.filter(i => i.type === "misc").length || 0,
    lowStock: inventory?.filter(i => 
      (i.type === "hop" && i.amount < 2) ||
      (i.type === "fermentable" && i.amount < 1) ||
      (i.type === "yeast" && i.amount < 1)
    ).length || 0,
  };
  
  return (
    <AdminGuard>
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <CosmicBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              ← Home
            </Link>
            <h1 className="text-xl font-bold font-mono">
              <span className="text-amber-500">INVENTORY</span>
              <span className="text-zinc-400">_</span>
              <span className="text-cyan-400">VAULT</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
            >
              + ADD ITEM
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-1">🌿</div>
            <div className="text-2xl font-mono font-bold text-green-400">{stats.hops}</div>
            <div className="text-xs text-zinc-500 uppercase">Hop Varieties</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-1">🌾</div>
            <div className="text-2xl font-mono font-bold text-orange-400">{stats.fermentables}</div>
            <div className="text-xs text-zinc-500 uppercase">Fermentables</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-1">🧫</div>
            <div className="text-2xl font-mono font-bold text-purple-400">{stats.yeast}</div>
            <div className="text-xs text-zinc-500 uppercase">Yeast Strains</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-500/10 border border-zinc-500/30 rounded-xl p-4 text-center"
          >
            <div className="text-3xl mb-1">📦</div>
            <div className="text-2xl font-mono font-bold text-zinc-400">{stats.misc}</div>
            <div className="text-xs text-zinc-500 uppercase">Misc Items</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`border rounded-xl p-4 text-center ${
              stats.lowStock > 0 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-green-500/10 border-green-500/30'
            }`}
          >
            <div className="text-3xl mb-1">{stats.lowStock > 0 ? '⚠️' : '✅'}</div>
            <div className={`text-2xl font-mono font-bold ${stats.lowStock > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {stats.lowStock}
            </div>
            <div className="text-xs text-zinc-500 uppercase">Low Stock</div>
          </motion.div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All", count: inventory?.length || 0 },
            { value: "hop", label: "Hops", count: stats.hops, icon: "🌿" },
            { value: "fermentable", label: "Fermentables", count: stats.fermentables, icon: "🌾" },
            { value: "yeast", label: "Yeast", count: stats.yeast, icon: "🧫" },
            { value: "misc", label: "Misc", count: stats.misc, icon: "📦" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as InventoryType | "all")}
              className={`px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap transition-all ${
                activeTab === tab.value
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        
        {/* Inventory Grid */}
        {!inventory ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              🦘
            </motion.div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-zinc-500"
          >
            <div className="text-6xl mb-4">📦</div>
            <p>No items in {activeTab === "all" ? "inventory" : `${activeTab}s`}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.map((item, index) => {
              const colors = TYPE_COLORS[item.type as InventoryType] || TYPE_COLORS.misc;
              const isLowStock = 
                (item.type === "hop" && item.amount < 2) ||
                (item.type === "fermentable" && item.amount < 1) ||
                (item.type === "yeast" && item.amount < 1);
              
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`${colors.bg} border ${colors.border} rounded-xl p-4 backdrop-blur-sm relative`}
                >
                  {isLowStock && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400">
                      LOW
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{colors.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{item.name}</h3>
                      <div className="text-sm text-zinc-400 capitalize">{item.type}</div>
                      
                      {/* Type-specific info */}
                      <div className="mt-2 text-xs text-zinc-500 space-y-0.5">
                        {item.type === "hop" && item.alpha && (
                          <div>Alpha: {item.alpha}%</div>
                        )}
                        {item.type === "fermentable" && (
                          <>
                            {item.color && <div>Color: {item.color}°L</div>}
                            {item.potential && <div>PPG: {item.potential}</div>}
                          </>
                        )}
                        {item.type === "yeast" && item.attenuation && (
                          <div>Attenuation: {item.attenuation}%</div>
                        )}
                        {item.supplier && <div>From: {item.supplier}</div>}
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right">
                      <div className={`text-2xl font-mono font-bold ${colors.text}`}>
                        {item.amount}
                      </div>
                      <div className="text-xs text-zinc-500">{item.unit}</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-zinc-700/50 flex items-center gap-2">
                    {editingItem === item._id ? (
                      <>
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={e => setAdjustAmount(e.target.value)}
                          placeholder="+/- amount"
                          className="flex-1 px-2 py-1 bg-zinc-800 border border-zinc-600 rounded text-sm font-mono focus:border-amber-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAdjustAmount(item._id, parseFloat(adjustAmount) || 0)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => { setEditingItem(null); setAdjustAmount(""); }}
                          className="px-3 py-1 bg-zinc-600 hover:bg-zinc-500 text-white text-sm rounded"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAdjustAmount(item._id, -1)}
                          className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustAmount(item._id, 1)}
                          className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => setEditingItem(item._id)}
                          className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="ml-auto px-3 py-1 text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
      </div>
      
      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-amber-500 mb-4 font-mono">ADD_ITEM</h3>
              
              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["hop", "fermentable", "yeast", "misc"] as InventoryType[]).map(type => {
                      const colors = TYPE_COLORS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => setNewItem({ ...newItem, type })}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            newItem.type === type
                              ? `${colors.bg} ${colors.border} ${colors.text}`
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                          }`}
                        >
                          <div className="text-xl">{colors.icon}</div>
                          <div className="text-xs capitalize">{type}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Name */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="Citra, Pale Malt, US-05..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                
                {/* Amount & Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Amount</label>
                    <input
                      type="number"
                      value={newItem.amount || ""}
                      onChange={e => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Unit</label>
                    <select
                      value={newItem.unit}
                      onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="oz">oz</option>
                      <option value="lb">lb</option>
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="pkg">pkg</option>
                    </select>
                  </div>
                </div>
                
                {/* Type-specific fields */}
                {newItem.type === "hop" && (
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Alpha Acid %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newItem.alpha || ""}
                      onChange={e => setNewItem({ ...newItem, alpha: parseFloat(e.target.value) || undefined })}
                      placeholder="12.0"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}
                
                {newItem.type === "fermentable" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase mb-1">Color (°L)</label>
                      <input
                        type="number"
                        value={newItem.color || ""}
                        onChange={e => setNewItem({ ...newItem, color: parseFloat(e.target.value) || undefined })}
                        placeholder="3"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-500 uppercase mb-1">PPG</label>
                      <input
                        type="number"
                        value={newItem.potential || ""}
                        onChange={e => setNewItem({ ...newItem, potential: parseFloat(e.target.value) || undefined })}
                        placeholder="37"
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
                
                {newItem.type === "yeast" && (
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Attenuation %</label>
                    <input
                      type="number"
                      value={newItem.attenuation || ""}
                      onChange={e => setNewItem({ ...newItem, attenuation: parseFloat(e.target.value) || undefined })}
                      placeholder="77"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                )}
                
                {/* Supplier */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Supplier (optional)</label>
                  <input
                    type="text"
                    value={newItem.supplier}
                    onChange={e => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="MoreBeer, YVH, LHBS..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.name || !newItem.amount}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-600 text-black font-bold rounded-lg transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
    </AdminGuard>
  );
}
