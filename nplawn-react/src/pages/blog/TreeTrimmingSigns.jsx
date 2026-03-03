import { Link } from 'react-router-dom';
import { PostHero, PostAuthor, PostCTA, PostRelated } from './BlogPost';

const SIGNS = [
  { title: 'Dead or Hanging Branches', desc: 'Dead branches are structurally weak and can fall without warning — especially in storms. A hanging branch (called a "widow maker" by arborists) is a serious safety hazard that needs immediate attention.' },
  { title: 'Branches Rubbing or Crossing', desc: 'Branches that rub against each other create wounds that invite pests and disease. Removing one of the crossing branches early prevents long-term damage.' },
  { title: 'Proximity to Your Home or Power Lines', desc: 'Branches growing toward your house, gutters, or power lines need proactive management before they cause damage or become a utility hazard.' },
  { title: 'Uneven or Lopsided Canopy', desc: 'An unbalanced canopy puts unequal stress on the tree\'s structure, making it more vulnerable to failure in wind or ice storms. Corrective pruning restores structural integrity.' },
  { title: 'Dense Canopy Blocking Light and Airflow', desc: 'A canopy that\'s too dense restricts light to the lawn below and traps moisture, creating conditions for fungal disease. Thinning improves air circulation and light penetration.' },
];

export default function TreeTrimmingSigns() {
  return (
    <>
      <PostHero tag="Tree Care" title="5 Signs Your Trees Need Professional Trimming Now" date="Feb 10, 2026" readTime="4 min read" />

      <div className="post-content">
        <p>Most homeowners think about tree trimming only after something goes wrong — a fallen branch, a damaged roof, or a utility call about overhanging limbs. But proactive trimming is almost always cheaper than reactive damage control, and it keeps your trees healthier over the long term.</p>
        <p>Here are five clear warning signs that your trees need professional attention — and why waiting makes each problem more expensive to fix.</p>

        <div className="post-callout">
          <p>"A $500 trimming job today prevents a $5,000 damage claim tomorrow. Proactive pruning is always the better investment."</p>
        </div>

        {SIGNS.map((s, i) => (
          <div key={i}>
            <h2>{i + 1}. {s.title}</h2>
            <p>{s.desc}</p>
          </div>
        ))}

        <hr/>

        <h2>Why Professional Trimming Matters</h2>
        <p>Improper pruning — cutting in the wrong place, at the wrong time, or removing too much — can permanently damage or kill a tree. ISA-certified arborists understand tree biology, proper pruning cuts, and species-specific timing. They also carry the insurance and equipment to safely handle large limbs and tall trees.</p>
        <p>For most residential trimming work, DIY is not the right choice. The risk — both to the tree and to personal safety — isn't worth it.</p>

        <div className="post-tip">
          <div className="post-tip-icon">💡</div>
          <p><strong>Pro tip:</strong> The best time to trim most deciduous trees is late winter while they're dormant — before new growth begins. This minimizes stress and reduces the risk of pest and disease problems from fresh cuts.</p>
        </div>

        <PostAuthor />
        <PostCTA heading="Schedule a Tree Inspection" body="Our certified arborists will assess your trees and recommend exactly what's needed — nothing more." linkTo="/tree-trimming" linkLabel="Tree Trimming Services" />
      </div>

      <PostRelated excludeSlug="tree-trimming-signs" />

      <section className="cta-section">
        <h2>Concerned About Your Trees?</h2>
        <p>Our team will assess your trees and give you an honest recommendation — no upselling.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Schedule an Assessment</Link>
      </section>
    </>
  );
}
