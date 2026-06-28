import { AbsoluteFill, Sequence } from 'remotion';
import { CodeScene } from '../scenes/CodeScene';
import { FeaturesScene } from '../scenes/FeaturesScene';
import { IntroScene } from '../scenes/IntroScene';
import { OutroScene } from '../scenes/OutroScene';
import { StackScene } from '../scenes/StackScene';

// Timing (in seconds) — must match Root.tsx DURATION_SECONDS
const TIMING = {
    intro: [0, 5],
    features: [5, 12],
    stack: [12, 18],
    code: [18, 24],
    outro: [24, 30],
} as const;

const fps = 30;

const toFrames = ([start, end]: readonly [number, number]) => ({
    from: start * fps,
    durationInFrames: (end - start) * fps,
});

export const MaestroDemo = () => {
    const intro = toFrames(TIMING.intro);
    const features = toFrames(TIMING.features);
    const stack = toFrames(TIMING.stack);
    const code = toFrames(TIMING.code);
    const outro = toFrames(TIMING.outro);

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0a0a0a',
                color: '#fafafa',
                fontFamily:
                    "'Instrument Sans', system-ui, -apple-system, sans-serif",
            }}
        >
            <Sequence {...intro}>
                <IntroScene />
            </Sequence>
            <Sequence {...features}>
                <FeaturesScene />
            </Sequence>
            <Sequence {...stack}>
                <StackScene />
            </Sequence>
            <Sequence {...code}>
                <CodeScene />
            </Sequence>
            <Sequence {...outro}>
                <OutroScene />
            </Sequence>
        </AbsoluteFill>
    );
};