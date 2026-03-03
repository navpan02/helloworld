import { Link } from 'react-router-dom';
import { PostHero, PostAuthor, PostCTA, PostRelated } from './BlogPost';

export default function AerateGuide() {
  return (
    <>
      <PostHero tag="Aeration & Seeding" title="When to Aerate Your Lawn: A Seasonal Guide" date="March 12, 2026" readTime="5 min read" />

      <div className="post-content">
        <p>If your lawn looks tired, compacted, or stubbornly refuses to green up despite regular watering and fertilizing, aeration is likely the missing piece. Aeration — the process of removing small plugs of soil from your lawn — breaks up compaction and lets water, oxygen, and nutrients reach the root zone where they're actually needed. But timing is everything. Aerating at the wrong time of year can stress your grass rather than help it.</p>

        <h2>What Is Lawn Aeration?</h2>
        <p>Core aeration uses a hollow-tine machine to pull out plugs of soil roughly 2–3 inches deep and ½ inch in diameter. These plugs are left on the surface, where they break down naturally over a few weeks, returning organic matter to the soil. The holes left behind relieve compaction and create channels for air, water, and fertilizer to penetrate directly into the root zone.</p>
        <p>Spike aeration — using solid tines to poke holes without removing soil — is less effective and can actually worsen compaction around the hole walls. We always recommend core aeration for lasting results.</p>

        <div className="post-callout">
          <p>"Compacted soil is one of the top five reasons lawns underperform. No amount of fertilizer can fix a lawn that can't breathe."</p>
        </div>

        <h2>Cool-Season vs. Warm-Season Grasses</h2>
        <p>The single most important factor in timing your aeration is your grass type. Most lawns in the Midwest and Northern US grow cool-season grasses.</p>

        <h3>Cool-Season Grasses</h3>
        <ul>
          <li>Kentucky Bluegrass, Tall Fescue, Fine Fescue, Perennial Ryegrass</li>
          <li>Grow most actively in spring (55–65°F) and fall (55–65°F)</li>
          <li>Go partially dormant in the peak heat of summer</li>
          <li>Common across the Midwest, Northeast, and Pacific Northwest</li>
        </ul>

        <h3>Warm-Season Grasses</h3>
        <ul>
          <li>Bermuda, Zoysia, St. Augustine, Centipede, Bahia</li>
          <li>Peak growth in summer when soil temps exceed 70°F</li>
          <li>Go dormant and turn brown in fall and winter</li>
          <li>Common in the Southeast, Southwest, and Gulf Coast</li>
        </ul>

        <h2>When to Aerate: The Best Windows</h2>

        <h3>Cool-Season Lawns: Early Fall Is Ideal</h3>
        <p>For cool-season grasses, <strong>late August through mid-October</strong> is the prime aeration window. Soil temperatures are still warm enough for rapid recovery, but air temperatures are cooling and fall rains are on the way. Aerating in fall also pairs perfectly with overseeding: fresh seed drops into the holes, makes excellent soil contact, and germinates before the ground freezes.</p>

        <div className="post-tip">
          <div className="post-tip-icon">💡</div>
          <p><strong>Pro tip:</strong> Schedule aeration at least 4 weeks before your first expected frost so the grass has time to recover and new seed can germinate before winter dormancy.</p>
        </div>

        <h3>Can You Aerate in Spring?</h3>
        <p>Spring aeration (April–May) is a second-best option for cool-season lawns. It helps break up winter compaction and prepares the soil for the active growing season. However, spring aeration opens the door for weed seeds — especially crabgrass — to take hold in the holes.</p>

        <h3>Warm-Season Lawns: Late Spring to Early Summer</h3>
        <p>Bermuda, Zoysia, and other warm-season grasses should be aerated when they're actively growing — typically <strong>May through June</strong>. Avoid aerating dormant warm-season grass in fall or winter.</p>

        <hr/>

        <h2>How Often Should You Aerate?</h2>
        <p>For most residential lawns: <strong>once a year</strong> is sufficient. High-traffic areas may benefit from twice-yearly aeration. Sandy soil lawns can get away with every other year.</p>

        <h2>Signs Your Lawn Needs Aeration Now</h2>
        <ul>
          <li>Water pools on the surface or runs off without soaking in</li>
          <li>The lawn feels spongy or the soil is rock-hard when you push a screwdriver in</li>
          <li>Thatch layer exceeds ½ inch</li>
          <li>The lawn gets heavy foot traffic — kids, pets, outdoor gatherings</li>
          <li>Grass is thin or patchy despite adequate water and fertilizer</li>
        </ul>

        <PostAuthor />
        <PostCTA heading="Ready to Aerate & Overseed?" body="Our crew handles everything — aeration, overseeding, and starter fertilizer in a single visit." linkTo="/aeration-seeding" linkLabel="See Our Service" />
      </div>

      <PostRelated excludeSlug="aerate-guide" />

      <section className="cta-section">
        <h2>Questions About Your Lawn?</h2>
        <p>Our specialists are happy to give honest, no-pressure advice tailored to your yard.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Contact Us</Link>
      </section>
    </>
  );
}
