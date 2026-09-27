import React from 'react'
import { Link } from 'react-router-dom'

const HERO_WORDS = ['Timeless.', 'Refined.', 'Unforgettable.']

const HomePage = () => (
  <div className="overflow-hidden">

    {/* ── Hero ──────────────────────────────────────────── */}
    <section className="relative min-h-[90vh] flex items-center justify-center bg-charcoal-950">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950 via-charcoal-900/40 to-charcoal-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-6">
          Maison de Parfum — Est. 2024
        </p>
        <h1 className="font-serif text-5xl sm:text-7xl font-semibold text-cream-100 leading-tight mb-6">
          The Art of<br />
          <span className="text-gold-400">Fragrance.</span>
        </h1>
        <p className="font-sans text-base text-charcoal-300 leading-relaxed max-w-xl mx-auto mb-10">
          Discover an exquisite collection of luxury parfums, curated for those who understand that a scent is not worn — it is experienced.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products"
            className="font-sans text-sm px-8 py-3 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded transition-all duration-300 font-medium tracking-wide shadow-lg shadow-gold-500/20">
            Explore Collection
          </Link>
          <Link to="/register"
            className="font-sans text-sm px-8 py-3 border border-charcoal-600 text-cream-100 hover:border-gold-500 hover:text-gold-300 rounded transition-all duration-300 tracking-wide">
            Create Account
          </Link>
        </div>
      </div>
    </section>

    {/* ── Values ────────────────────────────────────────── */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <p className="font-sans text-xs text-gold-400 tracking-[0.3em] uppercase mb-3">Our Philosophy</p>
        <h2 className="font-serif text-4xl text-cream-100">Crafted for Connoisseurs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            icon: '✦',
            title: 'Artisanal Quality',
            desc: 'Each fragrance is sourced from the finest houses in Grasse, Paris, and beyond, ensuring uncompromising quality.',
          },
          {
            icon: '◆',
            title: 'Curated Selection',
            desc: 'Our collection is meticulously curated to offer only the most distinctive and memorable olfactory experiences.',
          },
          {
            icon: '◇',
            title: 'Discreet Delivery',
            desc: 'Your fragrance arrives in bespoke packaging, ready to impress — whether a gift or a personal indulgence.',
          },
        ].map((item) => (
          <div key={item.title} className="text-center p-8 bg-charcoal-900 border border-charcoal-800 rounded-lg hover:border-gold-500/30 transition-colors">
            <span className="text-gold-400 text-2xl block mb-4">{item.icon}</span>
            <h3 className="font-serif text-xl text-cream-100 mb-3">{item.title}</h3>
            <p className="font-sans text-sm text-charcoal-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── CTA Banner ─────────────────────────────────────── */}
    <section className="bg-charcoal-900 border-y border-charcoal-800 py-20">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h2 className="font-serif text-4xl text-cream-100 mb-6">Begin Your Olfactory Journey</h2>
        <p className="font-sans text-sm text-charcoal-300 mb-8 leading-relaxed">
          A curated collection of fragrances awaits. From woody orientals to airy florals — find the scent that defines you.
        </p>
        <Link to="/products"
          className="font-sans text-sm px-10 py-3.5 bg-gold-500 text-charcoal-950 hover:bg-gold-400 rounded transition-all duration-300 font-medium tracking-wide inline-block shadow-xl shadow-gold-500/20">
          Shop Now
        </Link>
      </div>
    </section>
  </div>
)

export default HomePage
