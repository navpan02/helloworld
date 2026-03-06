import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ_ITEMS = [
  {
    category: 'Services & Pricing',
    questions: [
      {
        q: 'How is my annual price calculated?',
        a: 'Pricing is based on your property\'s square footage. Each plan (GrassBasic, GrassPro, GrassNatural) has tiered rates per square foot — larger properties get a lower rate per sqft. Use our Quote Estimator to see your exact price instantly.',
      },
      {
        q: 'Do you require a long-term contract?',
        a: 'No contracts required. Our lawn care plans are billed annually, but you can cancel before your next season without penalty. We earn your business year after year through results, not lock-ins.',
      },
      {
        q: 'What\'s the difference between GrassBasic, GrassPro, and GrassNatural?',
        a: 'GrassBasic (6 applications/year) covers essential seasonal treatments — fertilization, weed control, and spot care. GrassPro (7 applications/year) adds enhanced weed control, grub prevention, and disease management. GrassNatural (6 applications/year) uses 100% organic inputs — no synthetic chemicals, safe for kids, pets, and pollinators.',
      },
      {
        q: 'Do you offer one-time services, or only annual plans?',
        a: 'We offer both. One-time services include lawn mowing, tree trimming, aeration, seeding, and landscape design projects. Annual lawn care plans provide the best results since turf health builds season over season.',
      },
      {
        q: 'What areas do you serve?',
        a: 'We serve Naperville and surrounding Chicagoland communities including Plainfield, Bolingbrook, Aurora, Lisle, Downers Grove, Wheaton, and Romeoville. Contact us if you\'re unsure whether we cover your ZIP code.',
      },
    ],
  },
  {
    category: 'Scheduling & Visits',
    questions: [
      {
        q: 'How do I schedule a service?',
        a: 'You can order online through our Get a Quote form, call us directly, or use our contact form. We\'ll confirm your schedule within 1 business day.',
      },
      {
        q: 'Do I need to be home during service visits?',
        a: 'No. Most services are performed while you\'re at work or away. Just make sure your gates are unlocked and pets are secured. We\'ll send a service report after each visit.',
      },
      {
        q: 'What happens if it rains on my scheduled service day?',
        a: 'Light rain doesn\'t stop us for mowing and most treatments. If conditions are too wet for quality work (heavy rain, standing water), we\'ll reschedule your visit automatically and notify you.',
      },
      {
        q: 'How far in advance should I book?',
        a: 'For seasonal services like aeration and overseeding, booking 3–4 weeks ahead is ideal — especially in fall when demand is highest. Mowing and maintenance plans can usually start within 1–2 weeks.',
      },
    ],
  },
  {
    category: 'Lawn Care Tips',
    questions: [
      {
        q: 'When is the best time to aerate my lawn in the Chicagoland area?',
        a: 'For cool-season grasses common in the Midwest (Kentucky Bluegrass, Tall Fescue, Ryegrass), late August through mid-October is ideal. This window allows the grass to recover before winter and pairs perfectly with overseeding.',
      },
      {
        q: 'How short should I cut my grass?',
        a: 'Never remove more than one-third of the grass blade in a single mow. For cool-season grasses in the Midwest, a mowing height of 3–3.5 inches is ideal. Cutting too short stresses the lawn and allows weeds to take hold.',
      },
      {
        q: 'What grass type do most Naperville yards have?',
        a: 'Most lawns in the Naperville / Chicagoland area are cool-season mixes — commonly Kentucky Bluegrass, Tall Fescue, and Perennial Ryegrass. These thrive in spring and fall and go partially dormant in extreme summer heat. Check our Grass Type Guide for help identifying your grass.',
      },
      {
        q: 'How often should I water my lawn?',
        a: 'Most lawns need about 1 inch of water per week (rain + irrigation combined). It\'s better to water deeply 2–3 times per week than to water shallowly every day. Early morning watering reduces evaporation and fungal risk.',
      },
      {
        q: 'When should I fertilize my lawn?',
        a: 'Cool-season lawns in the Midwest benefit from fertilization in early spring (April), early summer (June), late summer (August), and fall (October). Fall is the most important application — it fuels root development going into winter.',
      },
    ],
  },
  {
    category: 'Account & Orders',
    questions: [
      {
        q: 'Can I view my past orders online?',
        a: 'Yes. Create an account or log in, then visit your Account page to see your full order history, service details, and annual pricing.',
      },
      {
        q: 'How do I update my service address or contact info?',
        a: 'Contact our team directly via the Contact page or by phone. We\'ll update your account and confirm any changes before your next visit.',
      },
      {
        q: 'Can I upgrade or downgrade my plan mid-season?',
        a: 'Yes. Contact us any time and we\'ll prorate the difference for remaining applications in your season. Upgrades take effect on your next scheduled visit.',
      },
    ],
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-np-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-np-surface transition-colors"
      >
        <span className="font-semibold text-np-dark text-sm md:text-base">{q}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 stroke-np-accent fill-none stroke-2 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 text-np-muted text-sm leading-relaxed border-t border-np-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="page-hero-badge">Help Center</div>
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about our services, scheduling, pricing, and lawn care — answered in plain English.</p>
      </section>

      <section className="pg-section white">
        <div className="max-w-3xl mx-auto">
          {FAQ_ITEMS.map(section => (
            <div key={section.category} className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1 bg-np-border"/>
                <p className="pg-label !mb-0 whitespace-nowrap">{section.category}</p>
                <div className="h-px flex-1 bg-np-border"/>
              </div>
              <div className="space-y-3">
                {section.questions.map(item => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}

          <div className="bg-np-dark rounded-2xl p-8 text-center mt-8">
            <h3 className="text-white text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-white/60 text-sm mb-6">Our team gives honest, no-pressure answers. No sales pitch.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/contact" className="btn-primary px-6 py-2.5">Contact Us</Link>
              <Link to="/grass-guide" className="btn-outline px-6 py-2.5 border-white/30 text-white hover:bg-white/10">Grass Type Guide</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
