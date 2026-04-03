import { MainLayout } from '@/components/layout/MainLayout';
import { Film, Globe, Play, Shield, Star, Tv, Users, Zap } from 'lucide-react';

const stats = [
  { label: 'Titles Available', value: '10,000+', icon: Film },
  { label: 'Active Users', value: '500K+', icon: Users },
  { label: 'Countries', value: '50+', icon: Globe },
  { label: 'Average Rating', value: '4.8★', icon: Star },
];

const features = [
  {
    icon: Zap,
    title: 'Ultra HD Streaming',
    description: 'Experience crystal-clear 4K HDR streaming with Dolby Audio support on all your devices.',
  },
  {
    icon: Shield,
    title: 'Family Safe',
    description: 'Parental controls and kid-friendly profiles ensure a safe experience for every member of the family.',
  },
  {
    icon: Globe,
    title: 'Watch Anywhere',
    description: 'Stream seamlessly across Smart TVs, phones, tablets, laptops, and game consoles.',
  },
  {
    icon: Tv,
    title: 'Offline Downloads',
    description: 'Download your favorite titles and watch them even when you\'re offline — no internet required.',
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="pb-16">
        {/* Hero */}
        <div className="relative bg-gradient-to-b from-red-950/40 to-zinc-950 px-4 sm:px-6 lg:px-8 py-24 text-center border-b border-zinc-800">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 mb-6">
              <Play className="w-4 h-4 text-red-500" fill="currentColor" />
              <span className="text-red-400 text-sm font-medium">About 3Play</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Stream Smarter,{' '}
              <span className="text-red-500">Watch Better</span>
            </h1>
            <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed">
              3Play is a next-generation streaming platform built for everyone — from casual viewers to dedicated
              cinephiles. We believe great entertainment should be accessible, beautiful, and personal.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-zinc-300 text-lg leading-relaxed mb-4">
              We started 3Play with a simple idea: streaming should feel effortless. Too many platforms make
              it hard to find what you love, charge too much for too little, and treat viewers as numbers
              instead of people.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              We&apos;re changing that. 3Play puts you in control — curated content, smart recommendations,
              family-friendly tools, and pricing that respects your budget. Whether you&apos;re binge-watching
              a new series or discovering a classic film, we want every session to feel personal.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-zinc-700 transition-colors"
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-red-600/10 rounded-xl">
                      <Icon className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-zinc-500 text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Why 3Play?</h2>
              <p className="text-zinc-400">Everything you need for the perfect streaming experience.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-600/10 rounded-xl shrink-0 group-hover:bg-red-600/20 transition-colors">
                        <Icon className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-red-950/30 to-zinc-900/50 border border-red-900/30 rounded-2xl p-10">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to start watching?</h2>
            <p className="text-zinc-400 mb-6">
              Join hundreds of thousands of viewers already enjoying 3Play. No credit card required to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/auth/register"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
              >
                Get Started Free
              </a>
              <a
                href="/browse"
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-8 py-3 rounded-xl border border-zinc-700 transition-colors"
              >
                Browse Titles
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
