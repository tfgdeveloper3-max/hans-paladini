import HeroAboutStack from "./components/HeroAboutStack";
import BooksShowcase from "./components/Books/BooksShowcase";
import ExploreWorld from "./components/World/ExploreWorld";
import SmoothScroll from "./components/SmoothScroll";
import StorySection from "./components/Story/StorySection";
import ExploreBooks from "./components/Portfolio/ExploreBooks";
import VideoTrailer from "./components/Trailer/VideoTrailer";
import Testimonials from "./components/Testimonials/Testimonials";
import FooterCTA from "./components/Footer/FooterCTA";

export default function App() {
  return (
    <main>
      <SmoothScroll />
      <HeroAboutStack />
      <BooksShowcase />
      <ExploreWorld />
      <StorySection />
      <ExploreBooks />
      <VideoTrailer />
      <Testimonials />
      <FooterCTA />
    </main>
  );
}