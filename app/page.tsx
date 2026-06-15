import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import NexoServicio from "@/components/sections/NexoServicio";
import Pasos from "@/components/sections/Pasos";
import Consulta from "@/components/sections/Consulta";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <NexoServicio />
        <Pasos />
        <Consulta />
      </main>
      <Footer />
    </>
  );
}
