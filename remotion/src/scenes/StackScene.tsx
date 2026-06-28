import { Easing, interpolate, useCurrentFrame } from 'remotion';
import '../styles.css';

const stack = [
    'Laravel 13',
    'Inertia 3',
    'React 19',
    'Tailwind 4',
    'stancl/tenancy',
    'spatie/permission',
    'motion',
    'Remotion',
];

export const StackScene = () => {
    const frame = useCurrentFrame();

    return (
        <div className="scene scene-column">
            <div className="section-heading">
                <p className="eyebrow">Stack</p>
                <h2 className="title-plain">A modern, type-safe foundation.</h2>
                <p className="subtitle">
                    Battle-tested tools, wired together for product work.
                </p>
            </div>
            <div className="stack-board">
                {stack.map((item, i) => {
                    const delay = 18 + i * 5;
                    const localFrame = Math.max(0, frame - delay);
                    const appear = interpolate(localFrame, [0, 16], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                    });

                    return (
                        <span
                            key={item}
                            className="chip"
                            style={{
                                opacity: appear,
                                translate: `0 ${(1 - appear) * 18}px`,
                                scale: 0.94 + appear * 0.06,
                            }}
                        >
                            {item}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
