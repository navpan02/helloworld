import { Link } from 'react-router-dom';
import { PostHero, PostAuthor, PostCTA, PostRelated } from './BlogPost';
import heroImg from '../../assets/mylawn.jpeg';

export default function SpringCareGuide() {
  return (
    <>
      <PostHero
        tag="Seasonal Care"
        title="Spring Lawn Care: Your Complete Chicagoland Checklist"
        date="April 5, 2026"
        readTime="8 min read"
      />

      <div className="post-content">
        <p>After a Chicagoland winter — weeks of frozen ground, salt spray, snow mold, and ice — your lawn needs a strategic recovery plan. Spring care isn't just about the first mow. Done right, the work you do between March and May sets the foundation for a thick, healthy lawn all summer long. Here's your complete checklist, timed for the Midwest.</p>

        <div className="post-callout">
          <p>"Spring is a recovery season. Don't rush it. Pushing your lawn too hard too early — mowing too short, fertilizing before it's ready, heavy foot traffic on soft soil — causes more damage than the winter did."</p>
        </div>

        <img
          src={heroImg}
          alt="Healthy green lawn in spring — NPLawn LLC, Naperville IL"
          className="w-full rounded-2xl my-8 object-cover max-h-80"
        />

        <h2>Your Spring Lawn Care Checklist</h2>

        <h3>1. Assess Winter Damage Before You Do Anything Else</h3>
        <p>Walk your lawn in early March, once the snow has fully melted, and take stock before you pick up a single tool. Common winter damage patterns in Chicagoland:</p>
        <ul>
          <li><strong>Snow mold:</strong> Circular gray or pink patches of matted, straw-colored grass. Rake the affected areas gently to break up the mat and improve airflow — most cases resolve naturally as temperatures rise. Severe cases may need a fungicide application.</li>
          <li><strong>Salt damage:</strong> Brown strips along driveways and sidewalks from road salt or ice melt runoff. Flush the affected areas thoroughly with water to dilute residual salt, then plan to overseed once soil temperatures warm.</li>
          <li><strong>Vole trails:</strong> Shallow, winding channels through the turf where voles tunneled under the snow. Rake out the dead material and overseed — these areas recover quickly.</li>
          <li><strong>Winter desiccation:</strong> Browning on exposed south- or west-facing slopes from drying winter winds. Most of this recovers without intervention once the soil warms.</li>
        </ul>

        <div className="post-tip">
          <div className="post-tip-icon">📋</div>
          <p><strong>Take notes or photos</strong> during your assessment. It's easy to forget where the thin spots were once everything greens up. Knowing the exact locations saves time when you're overseeding later.</p>
        </div>

        <h3>2. Rake Out Thatch and Winter Debris</h3>
        <p>Once the soil has thawed and dried out enough to walk on without leaving footprints, do a thorough spring rake. You're removing:</p>
        <ul>
          <li>Dead grass blades and matted thatch that accumulated over winter</li>
          <li>Leaves, sticks, and debris that weren't fully cleared in fall</li>
          <li>The matted material over any snow mold patches</li>
        </ul>
        <p>Use a flexible leaf rake — not a stiff garden rake — to avoid tearing up crowns of grass that are still fragile after winter dormancy. The goal is to remove dead material and let air and light reach the soil, not to dethatch aggressively.</p>

        <div className="post-tip">
          <div className="post-tip-icon">⚠️</div>
          <p><strong>Don't work on waterlogged soil.</strong> If your lawn is still soft and spongy, wait. Working on saturated soil compacts it and damages the root zone. A good test: step on the grass — if water squishes up around your foot, it's too wet.</p>
        </div>

        <h3>3. Apply Pre-Emergent Crabgrass Control — Timing Is Everything</h3>
        <p>Pre-emergent herbicide is one of the highest-value treatments in the spring lawn care calendar — but it only works if you apply it at the right time. Pre-emergents create a chemical barrier in the soil that prevents crabgrass seeds from germinating. Once crabgrass has sprouted, the window has closed.</p>
        <p>In Chicagoland, crabgrass germinates when soil temperatures at a 2-inch depth reach <strong>50–55°F for several consecutive days</strong>. That typically happens in <strong>mid-April to early May</strong> in the Naperville area, though it varies by year.</p>
        <p>A reliable rule of thumb: apply pre-emergent when forsythia (the yellow-flowering shrub) is in full bloom in your neighborhood. That bloom period correlates closely with the soil temperature window for crabgrass germination.</p>

        <PostCTA
          heading="Pre-Emergent Included in GrassPro and GrassBasic"
          body="Our spring fertilization rounds include pre-emergent crabgrass control, timed precisely for your soil conditions — not a calendar date."
          linkTo="/lawn-care"
          linkLabel="View Lawn Care Plans"
        />

        <h3>4. Time Your First Fertilization Correctly</h3>
        <p>Spring fertilization is important — but the timing mistake most homeowners make is fertilizing too early. Applying nitrogen while the grass is still coming out of dormancy pushes fast top growth at the expense of root development, and makes the lawn more susceptible to disease.</p>
        <p>Wait until your lawn has been mowed <strong>at least twice</strong> — meaning it's actively growing and has greened up on its own — before applying any fertilizer. In Naperville, that typically means <strong>late April to mid-May</strong> for the first fertilization round.</p>
        <p>The first spring application should be moderate in nitrogen — enough to encourage healthy growth without pushing the excessive surge that weak roots can't support. Our GrassBasic, GrassPro, and GrassNatural programs are calibrated for exactly this timing.</p>

        <h3>5. The First Mow: Height and Timing</h3>
        <p>Your first mow of the season sets the tone. Follow these guidelines:</p>
        <ul>
          <li><strong>Don't mow until the grass actually needs it</strong> — when it's growing consistently and has reached about 3.5–4 inches. In Chicagoland, that's typically late April.</li>
          <li><strong>Set your blade at 3–3.5 inches</strong> for cool-season grasses (Kentucky Bluegrass, Tall Fescue, Perennial Ryegrass). Never remove more than one-third of the blade length in a single mow.</li>
          <li><strong>Make sure your blade is sharp.</strong> A dull blade tears grass instead of cutting it cleanly, leaving ragged tips that turn brown and invite disease. Sharpen or replace your blade at the start of every season.</li>
          <li><strong>Don't bag the clippings</strong> unless you're cleaning up winter debris. Grass clippings decompose quickly and return nitrogen to the soil — the equivalent of one free fertilization per season.</li>
        </ul>

        <div className="post-tip">
          <div className="post-tip-icon">✂️</div>
          <p><strong>The one-third rule:</strong> Never cut more than one-third of the grass blade in a single mowing. Cutting more than that removes too much leaf surface at once, stresses the plant, and causes the lawn to turn yellow-brown within days.</p>
        </div>

        <h3>6. Aerate and Overseed Thin or Damaged Areas</h3>
        <p>Fall is the ideal aeration window for cool-season lawns — but spring aeration is a solid second option, especially for heavily compacted areas or lawns that took significant winter damage. If you're overseeding bare patches left by salt damage, vole trails, or snow mold, spring is a perfectly viable time to do it.</p>
        <p>For overseeding in spring, keep in mind:</p>
        <ul>
          <li>Soil temperature needs to be consistently above <strong>50°F</strong> for cool-season grass seed to germinate. That arrives in Naperville roughly in mid-April.</li>
          <li>If you're applying pre-emergent, you <strong>cannot also overseed</strong> the same area — the pre-emergent will prevent grass seed from germinating too. Spot-treat bare areas without pre-emergent and plan to address crabgrass those spots with post-emergent later if needed.</li>
          <li>New seedlings need consistent moisture for 2–3 weeks. Plan your overseeding around a period where you can water daily or rely on consistent spring rainfall.</li>
        </ul>

        <h3>7. Check and Restart Your Irrigation System</h3>
        <p>Before running your irrigation system for the first time, do a full inspection:</p>
        <ul>
          <li>Check for cracked or broken pipes — a common result of water that wasn't fully blown out before freezing</li>
          <li>Test each zone individually and inspect every head for proper coverage and spray pattern</li>
          <li>Reset the controller schedule — spring watering needs are very different from summer peak demand</li>
          <li>In early spring, your lawn likely needs little to no supplemental irrigation. Start running the system only when you see signs of drought stress (blue-gray tint, footprints that don't spring back)</li>
        </ul>

        <h3>8. Address Broadleaf Weeds Early</h3>
        <p>Dandelions, clover, and other broadleaf weeds are most vulnerable in spring when they're actively growing and before they've set seed. A post-emergent broadleaf herbicide applied in late April or May — when weeds are growing vigorously — is significantly more effective than trying to control them in summer heat.</p>
        <p>Spot-treating is preferable to blanket applications. If your lawn is thick and healthy, it will naturally crowd out most weeds on its own.</p>

        <PostAuthor />
        <PostCTA
          heading="Want Your Spring Lawn Care Handled by Experts?"
          body="Our certified crew handles fertilization timing, pre-emergent application, and aeration — all calibrated to your specific lawn and the Chicagoland season."
          linkTo="/buy-now"
          linkLabel="Get Started Today"
        />
      </div>

      <PostRelated excludeSlug="spring-care-guide" />

      <section className="cta-section">
        <h2>Ready for a Lawn You're Proud of This Spring?</h2>
        <p>Get a custom quote based on your property size. No contracts, no pressure.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/buy-now" className="btn-primary text-base px-8 py-4">Buy Now</Link>
          <Link to="/quote" className="btn-outline text-base px-8 py-4">Get a Free Quote</Link>
        </div>
      </section>
    </>
  );
}
