import { TapCard } from '@/components/TapCard';
import { PipelineCard } from '@/components/PipelineCard';
import breweryData from '@/data/brewery.json';

export default function Home() {
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
            {breweryData.name}
          </h1>
          <p className="text-xl text-amber-500 mb-2">{breweryData.tagline}</p>
          <p className="text-zinc-500">
            {breweryData.location} · Est. {breweryData.established}
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
            {breweryData.taps.map((tap) => (
              <TapCard
                key={tap.number}
                number={tap.number}
                status={tap.status as 'full' | 'half' | 'low' | 'kicked' | 'empty'}
                beer={tap.beer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-12 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-3xl">🫧</span>
            In The Pipeline
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breweryData.pipeline.map((item) => (
              <PipelineCard
                key={item.id}
                item={item as any}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {breweryData.archive.length + breweryData.pipeline.length}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Batches Brewed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {breweryData.setup.taps}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Taps</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {breweryData.setup.batchSize}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Batch Size</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-500">
                {new Set(breweryData.archive.map(b => b.style)).size}
              </div>
              <div className="text-zinc-500 text-sm mt-1">Styles Brewed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800 text-center">
        <p className="text-zinc-600 text-sm">
          {breweryData.name} · {breweryData.location}
        </p>
        <p className="text-zinc-700 text-xs mt-2">
          {breweryData.setup.system} · {breweryData.setup.philosophy}
        </p>
      </footer>
    </main>
  );
}
