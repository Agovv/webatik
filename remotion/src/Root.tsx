import { Composition } from 'remotion';
import { MaestroDemo } from './compositions/MaestroDemo';

const FPS = 30;
const DURATION_SECONDS = 30;
const DURATION_FRAMES = FPS * DURATION_SECONDS;
const WIDTH = 1920;
const HEIGHT = 1080;

export const Root = () => {
    return (
        <>
            <Composition
                id="MaestroDemo"
                component={MaestroDemo}
                durationInFrames={DURATION_FRAMES}
                fps={FPS}
                width={WIDTH}
                height={HEIGHT}
            />
        </>
    );
};