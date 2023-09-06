import Voice from '@/components/Voice';
import Noise from '@/components/Noise';
export default function Home() {
  return (
    <main className="flex">
      <section className="flex flex-col">
        <Voice id={0} />
        <Voice id={1} />
        <Voice id={2} />
        <Noise />
      </section>
    </main>
  );
}
