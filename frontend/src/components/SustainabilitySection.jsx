
import "./SustainabilitySection.css";

const goals = [
  {
    number: "12",
    title: "Responsible Consumption",
    description:
      "Give useful belongings a second life and encourage responsible reuse.",
    color: "#b68a18",
    icon: "♻️",
  },
  {
    number: "11",
    title: "Sustainable Communities",
    description:
      "Build a campus community where students share resources more easily.",
    color: "#df5144",
    icon: "🏡",
  },
  {
    number: "13",
    title: "Climate Action",
    description:
      "Support reuse practices that may help reduce the impact of new purchases.",
    color: "#3e7d43",
    icon: "🌱",
  },
];

export default function SustainabilitySection() {
  return (
    <section className="saanjha-purpose" id="about-saanjha">
      <div className="purpose-inner">
        <div className="purpose-copy">
          <span className="purpose-eyebrow">
            MORE THAN A MARKETPLACE
          </span>

          <h2>
            Good things deserve
            <span> a second life.</span>
          </h2>

          <p className="purpose-intro">
            Saanjha brings campus students together to discover,
            share and reuse belongings that still have value.
            Because one student's unused item can become another
            student's everyday essential.
          </p>

          <div className="purpose-values">
            <div>
              <span className="value-icon">🔄</span>
              <div>
                <strong>Reuse, not waste</strong>
                <p>Keep useful belongings in circulation.</p>
              </div>
            </div>

            <div>
              <span className="value-icon">🤝</span>
              <div>
                <strong>Community first</strong>
                <p>Make campus reuse simpler and more accessible.</p>
              </div>
            </div>

            <div>
              <span className="value-icon">🌍</span>
              <div>
                <strong>A more conscious campus</strong>
                <p>Make thoughtful consumption part of student life.</p>
              </div>
            </div>
          </div>
<a className="purpose-cta" href="/#browse">
            Explore listings <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="purpose-visual">
          <div className="purpose-orbit orbit-one" />
          <div className="purpose-orbit orbit-two" />

          <div className="purpose-illustration">
            <span className="floating-item item-book">📚</span>
            <span className="floating-item item-cycle">🚲</span>
            <span className="floating-item item-plant">🪴</span>
            <div className="purpose-center">
              <span>♻</span>
              <strong>Reuse.</strong>
              <strong>Reconnect.</strong>
              <small>Repeat.</small>
            </div>
          </div>

          <div className="purpose-note">
            <span>✳</span>
            Small choices. Meaningful change.
          </div>
        </div>
      </div>

      <div className="purpose-goals">
        <div className="goals-heading">
          <span className="purpose-eyebrow">OUR SUSTAINABILITY CONNECTION</span>
          <h3>Aligned with a more sustainable future.</h3>
          <p>
            Saanjha's reuse-first approach supports the intent of
            these United Nations Sustainable Development Goals.
          </p>
        </div>

        <div className="goal-grid">
          {goals.map((goal) => (
            <article className="goal-card" key={goal.number}>
              <div
                className="goal-number"
                style={{ backgroundColor: goal.color }}
              >
                <span>SDG</span>
                <strong>{goal.number}</strong>
              </div>

              <div className="goal-content">
                <span className="goal-icon">{goal.icon}</span>
                <h4>{goal.title}</h4>
                <p>{goal.description}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="purpose-disclaimer">
          These are areas of alignment, not claims of achieved impact.
          Environmental benefits depend on actual reuse and would
          need to be measured.
        </p>
      </div>
    </section>
  );
}
