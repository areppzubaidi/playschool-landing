const tiles = ['Art', 'Play', 'Read', 'Music', 'Garden', 'Nap'];
export default function Gallery() {
  return (
    <section id="gallery" className="section">
      <h2>A Day With Us</h2>
      <div className="gallery">
        {tiles.map((t, i) => <div key={i} className="tile">{t}</div>)}
      </div>
    </section>
  );
}
