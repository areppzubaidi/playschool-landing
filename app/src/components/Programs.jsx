const items = [
  { title: 'Creative Arts', desc: 'Painting, music, storytelling.' },
  { title: 'Early STEM', desc: 'Puzzles, blocks, discovery play.' },
  { title: 'Outdoor Play', desc: 'Garden time, nature walks.' },
  { title: 'Reading Circle', desc: 'Phonics and story sharing.' },
];
export default function Programs() {
  return (
    <section id="programs" className="section">
      <h2>Our Programs</h2>
      <div className="grid">
        {items.map(i => (
          <article key={i.title} className="card">
            <h3>{i.title}</h3>
            <p>{i.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
