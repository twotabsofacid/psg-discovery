import Sequencer from '@/helpers/Sequencer';

export default function Voice({ id }) {
  return (
    <main className="h-auto">
      <h1>Voice {id}</h1>
      <Sequencer id={id} />
    </main>
  );
}
