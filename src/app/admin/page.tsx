"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Id } from "../../../convex/_generated/dataModel";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingBeer, setEditingBeer] = useState<any>(null);

  const isValid = useQuery(
    api.admin.checkPassword,
    isAuthenticated ? "skip" : { password }
  );
  const taps = useQuery(api.admin.getAllTaps);
  const beers = useQuery(api.admin.getAllBeers);
  
  const assignToTap = useMutation(api.admin.assignToTap);
  const updateTapLevel = useMutation(api.admin.updateTapLevel);
  const patchBeer = useMutation(api.admin.patchBeer);
  const syncBrewfather = useAction(api.sync.syncFromBrewfather);

  useEffect(() => {
    if (isValid === true) {
      setIsAuthenticated(true);
    }
  }, [isValid]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncBrewfather();
      alert(`Synced ${result.synced} beers from Brewfather!`);
    } catch (error) {
      alert(`Sync failed: ${error}`);
    }
    setSyncing(false);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-2xl p-8 max-w-md w-full border border-zinc-800"
        >
          <h1 className="text-2xl font-bold text-white mb-2">🔐 Admin Access</h1>
          <p className="text-zinc-400 text-sm mb-6">Enter password to manage taps</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            onKeyDown={(e) => e.key === "Enter" && password && setPassword(password)}
          />
          
          {password && isValid === false && (
            <p className="text-red-400 text-sm mt-2">Incorrect password</p>
          )}
        </motion.div>
      </main>
    );
  }

  // Admin dashboard
  return (
    <main className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🍺 Tap Admin</h1>
            <p className="text-zinc-400">Manage your taps and beers</p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {syncing ? "Syncing..." : "Sync Brewfather"}
          </button>
        </div>

        {/* Taps Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Current Taps ({taps?.length || 0})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taps?.map((tap) => (
              <TapCard
                key={tap.number}
                tap={tap}
                beers={beers || []}
                onAssign={assignToTap}
                onUpdateLevel={updateTapLevel}
              />
            ))}
          </div>
        </section>

        {/* All Beers */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">All Beers ({beers?.length || 0})</h2>
          <p className="text-zinc-500 text-sm mb-4">Click a beer to edit its details</p>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">#</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">Style</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">ABV</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">Tagline</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-zinc-400 text-xs uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {beers?.map((beer) => (
                  <tr key={beer._id} className="hover:bg-zinc-800/50 cursor-pointer" onClick={() => setEditingBeer(beer)}>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-sm">#{beer.batchNo}</td>
                    <td className="px-4 py-3 text-white">{beer.name}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">{beer.style || '—'}</td>
                    <td className="px-4 py-3 text-amber-400 font-mono text-sm">{beer.abv}%</td>
                    <td className="px-4 py-3 text-zinc-500 text-sm italic max-w-[200px] truncate">
                      {beer.tagline || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={beer.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingBeer(beer); }}
                        className="text-amber-500 hover:text-amber-400 text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Back link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-zinc-500 hover:text-amber-500 transition-colors">
            ← Back to site
          </a>
        </div>
      </div>

      {/* Beer Edit Modal */}
      <AnimatePresence>
        {editingBeer && (
          <BeerEditModal
            beer={editingBeer}
            onClose={() => setEditingBeer(null)}
            onSave={async (updates) => {
              await patchBeer({ beerId: editingBeer._id, ...updates });
              setEditingBeer(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// Beer Edit Modal
function BeerEditModal({
  beer,
  onClose,
  onSave,
}: {
  beer: any;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: beer.name || '',
    style: beer.style || '',
    tagline: beer.tagline || '',
    abv: beer.abv?.toString() || '',
    ibu: beer.ibu?.toString() || '',
    srm: beer.srm?.toString() || '',
    yeast: beer.yeast || '',
    hops: (beer.hops || []).join(', '),
    malts: (beer.malts || []).join(', '),
    flavorTags: (beer.flavorTags || []).join(', '),
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const updates: any = {
      name: form.name,
      style: form.style,
      tagline: form.tagline || undefined,
      abv: parseFloat(form.abv) || undefined,
      ibu: parseFloat(form.ibu) || undefined,
      srm: parseFloat(form.srm) || undefined,
      yeast: form.yeast || undefined,
      hops: form.hops ? form.hops.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      malts: form.malts ? form.malts.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      flavorTags: form.flavorTags ? form.flavorTags.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
    };

    await onSave(updates);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 rounded-2xl p-6 max-w-lg w-full border border-zinc-800 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit Beer</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Style */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Style</label>
            <input
              type="text"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              placeholder="e.g. Hazy IPA, Black IPA, Pilsner..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Tagline <span className="text-zinc-600">(Skippy&apos;s one-liner)</span></label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="A witty description..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-400 text-sm mb-1">ABV %</label>
              <input
                type="number"
                step="0.1"
                value={form.abv}
                onChange={(e) => setForm({ ...form, abv: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">IBU</label>
              <input
                type="number"
                value={form.ibu}
                onChange={(e) => setForm({ ...form, ibu: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-sm mb-1">SRM <span className="text-zinc-600">(color)</span></label>
              <input
                type="number"
                value={form.srm}
                onChange={(e) => setForm({ ...form, srm: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Hops */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Hops <span className="text-zinc-600">(comma separated)</span></label>
            <input
              type="text"
              value={form.hops}
              onChange={(e) => setForm({ ...form, hops: e.target.value })}
              placeholder="Citra, Mosaic, Galaxy..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Malts */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Malts <span className="text-zinc-600">(comma separated)</span></label>
            <input
              type="text"
              value={form.malts}
              onChange={(e) => setForm({ ...form, malts: e.target.value })}
              placeholder="2-Row, Crystal 40, Munich..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Yeast */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Yeast</label>
            <input
              type="text"
              value={form.yeast}
              onChange={(e) => setForm({ ...form, yeast: e.target.value })}
              placeholder="US-05, Kveik, Windsor..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Flavor Tags */}
          <div>
            <label className="block text-zinc-400 text-sm mb-1">Flavor Tags <span className="text-zinc-600">(comma separated)</span></label>
            <input
              type="text"
              value={form.flavorTags}
              onChange={(e) => setForm({ ...form, flavorTags: e.target.value })}
              placeholder="tropical, citrus, juicy, hoppy..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Tap Card Component
function TapCard({
  tap,
  beers,
  onAssign,
  onUpdateLevel,
}: {
  tap: any;
  beers: any[];
  onAssign: any;
  onUpdateLevel: any;
}) {
  const [selectedBeer, setSelectedBeer] = useState<string>(tap.beerId || "");
  const [level, setLevel] = useState(tap.status);

  const availableBeers = beers.filter(
    (b) => b.status !== "planning" && b.status !== "brewing"
  );

  const handleAssign = async () => {
    await onAssign({
      tapNumber: tap.number,
      beerId: selectedBeer ? (selectedBeer as Id<"beers">) : undefined,
      status: level,
    });
  };

  const handleLevelChange = async (newLevel: string) => {
    setLevel(newLevel);
    await onUpdateLevel({
      tapNumber: tap.number,
      status: newLevel,
    });
  };

  // Status levels including conditioning
  const levels = ["conditioning", "full", "half", "low", "kicked"];

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Tap {tap.number}</h3>
        <StatusBadge status={tap.status} />
      </div>

      {/* Current beer */}
      {tap.beer && (
        <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
          <p className="text-white font-medium">{tap.beer.name}</p>
          <p className="text-zinc-400 text-sm">{tap.beer.style} · {tap.beer.abv}%</p>
        </div>
      )}

      {/* Beer selector */}
      <div className="space-y-3">
        <select
          value={selectedBeer}
          onChange={(e) => setSelectedBeer(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="">Empty tap</option>
          {availableBeers.map((beer) => (
            <option key={beer._id} value={beer._id}>
              #{beer.batchNo} - {beer.name}
            </option>
          ))}
        </select>

        {/* Level buttons - now includes conditioning */}
        <div className="flex gap-1 flex-wrap">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              className={`flex-1 min-w-[60px] px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                level === l
                  ? l === 'conditioning' 
                    ? "bg-cyan-500 text-black"
                    : "bg-amber-500 text-black"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {l === 'conditioning' ? 'Cond.' : l.charAt(0).toUpperCase() + l.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleAssign}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          Update Tap
        </button>
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    full: "bg-green-500/20 text-green-400",
    conditioning: "bg-cyan-500/20 text-cyan-400",
    half: "bg-amber-500/20 text-amber-400",
    low: "bg-orange-500/20 text-orange-400",
    kicked: "bg-red-500/20 text-red-400",
    empty: "bg-zinc-700/50 text-zinc-400",
    planning: "bg-blue-500/20 text-blue-400",
    brewing: "bg-yellow-500/20 text-yellow-400",
    fermenting: "bg-purple-500/20 text-purple-400",
    carbonating: "bg-cyan-500/20 text-cyan-400",
    "on-tap": "bg-green-500/20 text-green-400",
    archived: "bg-zinc-700/50 text-zinc-400",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors.archived}`}>
      {status}
    </span>
  );
}
