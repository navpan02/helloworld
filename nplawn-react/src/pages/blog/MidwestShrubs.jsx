import { Link } from 'react-router-dom';
import { PostHero, PostAuthor, PostCTA, PostRelated } from './BlogPost';

export default function MidwestShrubs() {
  return (
    <>
      <PostHero tag="Shrubs" title="The Best Shrubs for Year-Round Curb Appeal in the Midwest" date="Dec 15, 2025" readTime="5 min read" />

      <div className="post-content">
        <p>Choosing shrubs for a Midwest property is a test of patience, realism, and plant knowledge. The region can swing from brutally cold winters (USDA zones 4–6 across most of Illinois, Indiana, Ohio, Michigan, and Wisconsin) to sweltering, humid summers that rival the South. Shrubs that thrive in Seattle or Georgia often struggle or die outright in these conditions. The good news: there are outstanding native and near-native selections that deliver color, structure, and interest across all four seasons.</p>

        <h2>Why Native Shrubs Win in the Midwest</h2>
        <p>Native plants evolved in your specific climate, soil type, and rainfall patterns. That means they've developed the root systems to survive freeze-thaw cycles, the drought tolerance to make it through July without irrigation once established, and the disease resistance built up through millennia of local adaptation.</p>
        <p>Non-native ornamentals (burning bush, Japanese barberry, Bradford pear) are often aggressive spreaders that outcompete native vegetation. Many states have moved to restrict or ban some of these species.</p>

        <h2>Spring Interest: The Season Starter</h2>

        <h3>Serviceberry (Amelanchier canadensis or A. arborea)</h3>
        <p>Serviceberry earns its place as a landscape standout in every season, but spring is its showstopper moment. Delicate white flowers open before the leaves emerge in April — and they're breathtaking against a grey early-spring sky. By late spring, the small, blueberry-like fruits ripen to dark purple and are beloved by birds. Fall color ranges from orange to red-purple. It's drought-tolerant once established, grows 6–20 feet depending on variety, and thrives in both full sun and part shade.</p>

        <h3>Native Spicebush (Lindera benzoin)</h3>
        <p>Spicebush is one of the earliest blooming native shrubs, with tiny yellow flowers appearing in March or April along bare stems. By fall, the red berries and clear yellow fall foliage make it a standout. Grows 6–12 feet, tolerates wet soils and shade, and has virtually no serious pest or disease problems.</p>

        <h2>Summer Interest: Color and Structure</h2>

        <h3>Wild Hydrangea (Hydrangea arborescens 'Annabelle')</h3>
        <p>While 'Annabelle' is a cultivar, it's derived from our native Hydrangea arborescens and thrives in Midwest conditions. Large, white globe-shaped flower heads appear in June and July, often as large as dinner plates. It's shade-tolerant, cuts back hard each spring, and requires no special pruning knowledge.</p>

        <h3>Buttonbush (Cephalanthus occidentalis)</h3>
        <p>For wet areas — low spots that flood after rain, rain gardens, or edges near ponds — buttonbush is unmatched. Its unusual, spherical white flowers appear midsummer and are magnets for bees, butterflies, and hummingbirds. Grows 5–12 feet, handles both full sun and partial shade.</p>

        <div className="post-callout">
          <p>"The best shrub for curb appeal is one that thrives without constant intervention. In the Midwest, that almost always means starting with a native or near-native species."</p>
        </div>

        <h2>Fall Interest: The Color Show</h2>

        <h3>Winterberry Holly (Ilex verticillata)</h3>
        <p>If you've driven past a garden in November and seen a shrub absolutely blazing with red berries after the leaves have dropped, you've seen winterberry holly. It's arguably the most visually dramatic native shrub in the Midwest fall and winter landscape. Important note: you need both a male and female plant for berry production — one male plant pollinates up to five females.</p>

        <h3>Native Viburnum (Viburnum lentago / V. dentatum)</h3>
        <p>Viburnums are workhorses of the Midwest landscape. The native species offer white flower clusters in spring, blue-black berries in fall, and outstanding fall foliage in shades of burgundy and red. Sizes range from 5 to 18 feet depending on species.</p>

        <h2>Winter Interest: Structure When Everything Else Is Bare</h2>

        <h3>Red Twig Dogwood (Cornus sericea)</h3>
        <p>Winter is when red twig dogwood shines brightest. The young stems glow vivid red against snow, providing color in an otherwise monochromatic landscape. For best stem color, cut one-third of the oldest stems to the ground each spring to encourage fresh, brightly colored new growth.</p>

        <h3>Witch Hazel (Hamamelis virginiana)</h3>
        <p>Witch hazel is a conversation starter — it blooms in late fall and early winter, sometimes through November and December, with spidery yellow flowers that smell like cloves. It's the last shrub blooming when everything else has gone dormant.</p>

        <hr/>

        <h2>Sizing and Placement Tips</h2>
        <p>The most common shrub installation mistake is planting too close to the house or to each other based on nursery size rather than mature size. Check the tag — then add 20% for good measure.</p>
        <ul>
          <li>Allow at least 3–4 feet between shrubs and your foundation for air circulation</li>
          <li>Odd-numbered groupings (3, 5, 7) look more natural than even-numbered rows</li>
          <li>Place the tallest shrubs at the back or corners, shorter ones in front</li>
          <li>Group shrubs with similar water needs to simplify irrigation</li>
        </ul>

        <div className="post-tip">
          <div className="post-tip-icon">💡</div>
          <p><strong>Pro tip:</strong> Mulch newly planted shrubs with a 3-inch ring of wood chips (keeping mulch away from stems) and water deeply weekly for the first full growing season. After that, most established native shrubs can fend for themselves.</p>
        </div>

        <PostAuthor />
        <PostCTA heading="Need Help Choosing and Installing Shrubs?" body="Our team selects the right species for your site conditions and handles planting and establishment." linkTo="/tree-shrubs" linkLabel="Tree & Shrub Services" />
      </div>

      <PostRelated excludeSlug="midwest-shrubs" />

      <section className="cta-section">
        <h2>Transform Your Curb Appeal This Season</h2>
        <p>Our team will source, plant, and establish the right shrubs for your property and climate.</p>
        <Link to="/contact" className="btn-primary text-base px-8 py-4">Get Started</Link>
      </section>
    </>
  );
}
