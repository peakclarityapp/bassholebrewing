"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TapCard } from "@/components/TapCard";
import { PipelineCard } from "@/components/PipelineCard";

export default function Home() {
  const brewery = useQuery(api.brewery.getBrewery);
  const taps = useQuery(api.brewery.getTaps);
  const pipeline = useQuery(api.brewery.getPipeline);
  const archive = useQuery(api.brewery.getArchive);

  // Loading state
  if (!brewery || !taps || !pipeline || !archive) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-amber-500 text-xl">Loading...</div>
      </main>
    );
  }

  const totalBatches = (archive?.length || 0) + (pipeline?.length || 0);
  const uniqueStyles = new Set(archive?.map((b) => b.style) || []).size;

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative py-16 px-4 text-center border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <img
            src="/logo.jpg"
            alt="Bass Hole Brewing"
            className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 rounded-2xl object-cover"
          />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            {brewery.name}
          </h1>
          <p className="text-xl text-amber-500 mb-2">{brewery.tagline}</p>
          <p className="text-zinc-500">
            {brewery.location} · Est. {brewery.established}
          </p>
        </div>

        {/* Decorative amber glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* What's On Tap */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">🍺</span>
            What&apos;s On Tap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {taps.map((tap) => (
              <TapCard
                key={tap.number}
                number={tap.number}
                status={tap.status}
                beer={
                  tap.beer
                    ? {
                        id: tap.beer._id,
                        name: tap.beer.name,
                        style: tap.beer.style,
                        tagline: tap.beer.tagline,
                        abv: tap.beer.abv,
                        ibu: tap.beer.ibu,
                        batchNo: tap.beer.batchNo,
                      }
                    : null
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      {pipeline.length > 0 && (
        <section className="py-12 px-4 bg-zinc-900/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-3xl">🫧</span>
              In The Pipeline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pipeline.map((item) => (
                <PipelineCard
                  key={item._id}
                  item={{
                    id: item._id,
                    name: item.name,
                    style: item.style,
                    status: item.status as any,
                    brewDate: item.brewDate,
                    batchNo: item.batchNo,
                    daysIn: item.daysIn,
                    notes: item.notes,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {totalBatches}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Batches Brewed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">4</div>
              <div className="text-zinc-500 text-sm mt-1">Taps</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {brewery.batchSize}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Batch Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {uniqueStyles}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Styles Brewed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 text-center">
        <p className="text-zinc-600 text-sm">
          {brewery.name} · {brewery.location}
        </p>
        <p className="text-zinc-700 text-xs mt-2">
          {brewery.system} · {brewery.philosophy}
        </p>
      </footer>
    </main>
  );
}
