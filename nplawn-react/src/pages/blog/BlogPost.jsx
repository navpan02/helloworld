import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../Blog';

export function PostHero({ tag, title, date, readTime }) {
  return (
    <section className="page-hero text-left">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="post-back">
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Blog
        </Link>
        <div className="post-hero-tag">{tag}</div>
        <h1 className="text-3xl md:text-5xl">{title}</h1>
        <div className="post-hero-meta">
          <span>📅 {date}</span>
          <span>·</span>
          <span>🕐 {readTime}</span>
          <span>·</span>
          <span>By NPLawn Expert Team</span>
        </div>
      </div>
    </section>
  );
}

export function PostAuthor() {
  return (
    <div className="post-author">
      <div className="post-author-avatar">
        <svg viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
      </div>
      <div>
        <div className="post-author-name">NPLawn Expert Team</div>
        <div className="post-author-role">Certified Horticulturalists · NPLawn LLC</div>
      </div>
    </div>
  );
}

export function PostCTA({ heading, body, linkTo, linkLabel }) {
  return (
    <div className="post-cta-box">
      <div className="post-cta-box-text">
        <h3>{heading}</h3>
        <p>{body}</p>
      </div>
      <Link to={linkTo} className="btn-primary whitespace-nowrap">{linkLabel}</Link>
    </div>
  );
}

export function PostRelated({ excludeSlug }) {
  const related = BLOG_POSTS.filter(p => p.slug !== excludeSlug).slice(0, 2);
  return (
    <section className="post-related">
      <p className="pg-label">Keep Reading</p>
      <h2 className="pg-title">More From the Blog</h2>
      <div className="blog-grid">
        {related.map(p => (
          <div key={p.slug} className="blog-card">
            <div className="blog-img">
              <svg viewBox="0 0 24 24">{p.icon}</svg>
            </div>
            <div className="blog-body">
              <p className="blog-tag">{p.tag}</p>
              <h3>{p.title}</h3>
              <p>{p.excerpt.slice(0, 80)}…</p>
              <Link to={`/blog/${p.slug}`} className="blog-read">Read article &rarr;</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
