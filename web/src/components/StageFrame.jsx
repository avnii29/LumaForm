import DepthStage from './DepthStage.jsx';

/**
 * Stage chrome with natural aspect ratio + 3D floating depth.
 */
export default function StageFrame({ image, children, className = '', intensity = 1 }) {
  const ratio =
    image && image.width > 0 && image.height > 0
      ? `${image.width} / ${image.height}`
      : '1 / 1';

  return (
    <DepthStage className={className} aspectRatio={ratio} intensity={intensity}>
      {children}
    </DepthStage>
  );
}
