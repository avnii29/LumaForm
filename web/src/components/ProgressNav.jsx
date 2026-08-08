const SCENES = [
  { id: 'scene-01' },
  { id: 'scene-02' },
  { id: 'scene-03' },
  { id: 'scene-04' },
  { id: 'scene-05' },
];

export default function ProgressNav({ activeId }) {
  const scrollTo = (id) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  return (
    <nav className="progress-nav" aria-label="Progress">
      {SCENES.map((s, i) => (
        <button
          key={s.id}
          type="button"
          className={`progress-dot ${activeId === s.id ? 'active' : ''}`}
          onClick={() => scrollTo(s.id)}
          aria-label={`Section ${i + 1}`}
          aria-current={activeId === s.id ? 'true' : undefined}
        />
      ))}
    </nav>
  );
}

export const SCENE_IDS = SCENES.map((s) => s.id);
