import { Easing, interpolate, useCurrentFrame } from 'remotion';
import '../styles.css';

export const OutroScene = () => {
    const frame = useCurrentFrame();

    const scale = interpolate(frame, [0, 44], [0.92, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    const subtitleY = interpolate(frame, [20, 50], [20, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    return (
        <div className="scene scene-column">
            <div
                className="maestro-mark mark-large"
                style={{
                    scale,
                    opacity: interpolate(frame, [0, 30], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                }}
            >
                <span className="mark-m">M</span>
                <span className="mark-spark">✦</span>
            </div>
            <p className="eyebrow" style={{ opacity: interpolate(frame, [0, 20], [0, 1]) }}
            >
                Ready to ship?
            </p>
            <h2
                className="hero-title outro-title"
                style={{
                    scale,
                }}
            >
                Start building with Maestro.
            </h2>
            <p
                className="subtitle"
                style={{
                    opacity: subtitleOpacity,
                    transform: `translateY(${subtitleY}px)`,
                }}
            >
                github.com/danidoble/maestro
            </p>
        </div>
    );
};
