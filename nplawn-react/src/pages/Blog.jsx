import { Link } from 'react-router-dom';

export const BLOG_POSTS = [
  {
    slug: 'spring-care-guide',
    tag: 'Seasonal Care',
    title: 'Spring Lawn Care: Your Complete Chicagoland Checklist',
    excerpt: 'After a Chicagoland winter, your lawn needs a strategic recovery plan. This checklist covers damage assessment, pre-emergent timing, first mow guidelines, fertilization, and everything your lawn needs to thrive from April through May.',
    date: 'April 5, 2026',
    readTime: '8 min read',
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
  },
  {
    slug: 'winter-prep-guide',
    tag: 'Seasonal Care',
    title: 'How to Prep Your Lawn for Winter: A Chicagoland Checklist',
    excerpt: 'Fall is the most important maintenance window of the year. This checklist covers fertilization timing, aeration windows, leaf removal, and everything your lawn needs before the ground freezes.',
    date: 'March 6, 2026',
    readTime: '7 min read',
    icon: <>
      <path d="M2 12h20M12 2v20"/>
      <path d="M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
    </>,
  },
  {
    slug: 'best-grass-types',
    tag: 'Lawn Education',
    title: 'Best Grass Types for Naperville and Chicagoland Lawns',
    excerpt: 'Kentucky Bluegrass, Tall Fescue, Fine Fescue, Perennial Ryegrass — which one belongs in your yard? A practical guide to cool-season grasses for the Midwest, including how to identify what you already have.',
    date: 'March 6, 2026',
    readTime: '8 min read',
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
  },
  {
    slug: 'aerate-guide',
    tag: 'Aeration & Seeding',
    title: 'When to Aerate Your Lawn: A Seasonal Guide',
    excerpt: 'Timing is everything when it comes to aeration. Learn when to aerate based on your grass type and climate zone, and why fall is usually your best bet.',
    date: 'March 12, 2026',
    readTime: '5 min read',
    icon: <>
      <circle cx="12" cy="12" r="2"/>
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
    </>,
  },
  {
    slug: 'organic-fertilizers',
    tag: 'Lawn Care',
    title: 'Organic vs. Traditional Fertilizers: What\'s Right for Your Yard?',
    excerpt: 'We break down the pros and cons of synthetic versus organic fertilizers, plus which scenarios call for each — including our GrassNatural program.',
    date: 'Feb 28, 2026',
    readTime: '6 min read',
    icon: <path d="M12 22V12M12 12C12 7 7 3 2 4c0 5 4 9 10 8zM12 12c0-5 5-9 10-8-1 5-5 9-10 8z"/>,
  },
  {
    slug: 'tree-trimming-signs',
    tag: 'Tree Care',
    title: '5 Signs Your Trees Need Professional Trimming Now',
    excerpt: 'Dead branches, uneven canopy, rubbing limbs — these aren\'t just cosmetic issues. Ignoring them can cost you far more than a trim.',
    date: 'Feb 10, 2026',
    readTime: '4 min read',
    icon: <>
      <path d="M6 3v18M6 3l6 6M6 3l-3 6"/>
      <path d="M18 6v15M18 6l3 6M18 6l-3 6"/>
    </>,
  },
  {
    slug: 'low-maintenance-landscape',
    tag: 'Landscape Design',
    title: 'Designing a Low-Maintenance Landscape That Still Looks Amazing',
    excerpt: 'A beautiful yard doesn\'t have to demand your weekends. Discover plant choices, mulching strategies, and layout tricks that cut upkeep without cutting style.',
    date: 'Jan 24, 2026',
    readTime: '7 min read',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  },
  {
    slug: 'one-third-rule',
    tag: 'Mowing',
    title: 'The One-Third Rule: Why Cutting Too Short Kills Your Lawn',
    excerpt: 'Never remove more than one-third of the grass blade in a single mow. Here\'s the science behind this golden rule and how our crews apply it every visit.',
    date: 'Jan 8, 2026',
    readTime: '3 min read',
    icon: <path d="M3 17h18M3 12h18M3 7h18"/>,
  },
  {
    slug: 'midwest-shrubs',
    tag: 'Shrubs',
    title: 'The Best Shrubs for Year-Round Curb Appeal in the Midwest',
    excerpt: 'Native selections that thrive through harsh winters and blazing summers, stay manageable in size, and give your property color in every season.',
    date: 'Dec 15, 2025',
    readTime: '5 min read',
    icon: <><circle cx="12" cy="8" r="5"/><path d="M12 13v9M9 22h6"/></>,
  },
  {
    slug: 'mental-benefits-green-lawn',
    tag: 'Wellness',
    title: 'The Science-Backed Mental Health Benefits of a Beautiful Lawn',
    excerpt: 'Research shows that green outdoor spaces reduce cortisol, improve mood, and boost focus. Here\'s what the science says about your lawn\'s impact on your mental well-being — and how to make the most of it.',
    date: 'March 8, 2026',
    readTime: '6 min read',
    icon: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  },
  {
    slug: 'family-outdoor-space',
    tag: 'Family Life',
    title: 'Why Your Backyard Is Your Family\'s Most Underused Asset',
    excerpt: 'A well-maintained lawn isn\'t just curb appeal — it\'s where memories are made. From summer cookouts to kids\' first cartwheels, here\'s how to turn your yard into the family gathering spot it was always meant to be.',
    date: 'March 8, 2026',
    readTime: '5 min read',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  },
  {
    slug: 'cleanlawn-marketplace-guide',
    tag: 'CleanLawn',
    title: 'How the CleanLawn Marketplace Works: A Complete Guide for Homeowners',
    excerpt: 'What is CleanLawn, who are the providers, and how do you get the best results from on-demand lawn services? Everything you need to know before your first booking.',
    date: 'March 8, 2026',
    readTime: '7 min read',
    icon: <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
  },
];

export default function Blog() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div className="page-hero-badge">Tips & Insights</div>
        <h1>The NPLawn Blog</h1>
        <p>Lawn care advice, seasonal guides, and landscaping inspiration from our expert team — written in plain English.</p>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Latest Articles</p>
        <h2 className="pg-title">From Our Team</h2>
        <p className="pg-sub mb-9">Practical tips you can use whether you're a DIYer or a full-service client.</p>

        <div className="blog-grid">
          {BLOG_POSTS.map(post => (
            <div key={post.slug} className="blog-card">
              <div className="blog-img">
                <svg viewBox="0 0 24 24">{post.icon}</svg>
              </div>
              <div className="blog-body">
                <p className="blog-tag">{post.tag}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <p className="blog-meta">📅 {post.date} &nbsp;•&nbsp; 🕐 {post.readTime}</p>
                <Link to={`/blog/${post.slug}`} className="blog-read">Read article &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Want Advice for Your Specific Yard?</h2>
        <p>Our team is happy to answer questions directly. No sales pitch, just honest lawn care guidance.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Ask Our Team</Link>
      </section>
    </>
  );
}
