import { Link } from 'react-router-dom';
import { PostHero, PostAuthor, PostCTA, PostRelated } from './BlogPost';

export default function OneThirdRule() {
  return (
    <>
      <PostHero tag="Mowing" title="The One-Third Rule: Why Cutting Too Short Kills Your Lawn" date="Jan 8, 2026" readTime="3 min read" />

      <div className="post-content">
        <p>There's one rule in lawn care that professional turf managers follow more strictly than any other: never remove more than one-third of the grass blade in a single mowing. Violate it consistently and you'll end up with a stressed, thin, weed-prone lawn that requires constant intervention to maintain. Follow it, and your grass practically takes care of itself.</p>

        <h2>Why One-Third?</h2>
        <p>Grass blades are solar panels. The leaf blade is where the plant manufactures the energy it needs to grow roots, resist drought, and fight off disease. When you cut too much at once, the grass enters "survival mode" — it diverts energy from roots and disease resistance to rapidly regrowing leaf tissue. The result:</p>
        <ul>
          <li>Shallow root systems that can't access deep soil moisture</li>
          <li>Thin, pale grass that turns yellow or brown under heat stress</li>
          <li>Weakened turf that opens up space for crabgrass and broadleaf weeds to take hold</li>
          <li>Increased disease susceptibility, especially in humid conditions</li>
        </ul>

        <div className="post-callout">
          <p>"Scalping your lawn once can set back recovery by weeks. In peak summer heat, a single bad cut can cause damage that lasts the rest of the season."</p>
        </div>

        <h2>What This Looks Like in Practice</h2>
        <p>If you want to maintain your lawn at 3 inches (recommended for most cool-season grasses), you should mow when it reaches 4.5 inches — removing 1.5 inches, which is exactly one-third of the total height. If you let it grow to 6 inches and then cut it down to 3, you've removed half the blade — a significant stress event.</p>
        <p>During peak growing season (spring and early fall), this may mean mowing every 5–7 days. During summer dormancy or slow growth periods, every 10–14 days may be sufficient.</p>

        <h2>Mowing Height by Grass Type</h2>
        <ul>
          <li><strong>Kentucky Bluegrass:</strong> 2.5–3.5 inches</li>
          <li><strong>Tall Fescue:</strong> 3–4 inches (higher in summer)</li>
          <li><strong>Fine Fescue:</strong> 2.5–3 inches</li>
          <li><strong>Perennial Ryegrass:</strong> 2–3.5 inches</li>
          <li><strong>Bermuda (warm-season):</strong> 1–2 inches</li>
          <li><strong>Zoysia (warm-season):</strong> 1–2.5 inches</li>
        </ul>

        <h2>How We Apply This Rule</h2>
        <p>Our mowing crews follow the one-third rule on every visit, adjusting frequency seasonally rather than sticking to a rigid calendar schedule. In early spring when growth is rapid, we may increase visit frequency. In summer heat or drought, we raise the deck height to leave more leaf tissue and reduce moisture stress.</p>
        <p>We also rotate mowing patterns on each visit — mowing in different directions prevents soil compaction ruts and encourages upright grass growth rather than the grass bending in one direction.</p>

        <div className="post-tip">
          <div className="post-tip-icon">💡</div>
          <p><strong>Pro tip:</strong> Leave grass clippings on the lawn. They break down quickly, returning nitrogen to the soil and reducing your fertilizer needs by up to 25%. Only bag clippings if they're forming heavy clumps.</p>
        </div>

        <PostAuthor />
        <PostCTA heading="Want Consistent, Professional Mowing?" body="Our crew follows best-practice turf science on every visit — including the one-third rule, every time." linkTo="/mowing" linkLabel="See Mowing Services" />
      </div>

      <PostRelated excludeSlug="one-third-rule" />

      <section className="cta-section">
        <h2>Ready for a Better-Looking Lawn?</h2>
        <p>Proper mowing is just the start. Contact us for a full lawn assessment.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Contact Us</Link>
      </section>
    </>
  );
}
