export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <nav className="nav" aria-label="Primary">
        <div className="logo">Little Sprouts</div>
        <ul>
          <li><a href="#programs">Programs</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#gallery">Gallery</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
      <div className="hero-content">
        <h1 id="hero-title">Where Big Futures<br/><span>Bloom Big</span></h1>
        <p>A safe, joyful, play-based early-learning home for ages 2 to 6.</p>
        <a className="cta" href="#contact">Book a Tour</a>
      </div>
    </section>
  );
}
