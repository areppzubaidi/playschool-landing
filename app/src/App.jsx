import Hero from './components/Hero';
import Programs from './components/Programs';
import About from './components/About';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './index.css';

export default function App() {
  return (
    <main>
      <Hero />
      <Programs />
      <About />
      <Gallery />
      <Contact />
      <Footer />
    </main>
  );
}
