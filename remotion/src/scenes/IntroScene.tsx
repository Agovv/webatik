import { Easing, interpolate, useCurrentFrame } from 'remotion';
import '../styles.css';

export const IntroScene = () => {
    const frame = useCurrentFrame();

    const logoScale = interpolate(frame, [0, 42], [0.82, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    const copyOpacity = interpolate(frame, [36, 82], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const panelX = interpolate(frame, [58, 110], [90, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    return (
        <div className="scene scene-split">
            <div className="copy-stack" style={{ opacity: copyOpacity }}>
                <div className="brand-lockup">
                    <div
                        className="maestro-mark"
                        style={{
                            scale: logoScale,
                        }}
                    >
                        <span className="mark-m">M</span>
                        <span className="mark-spark">✦</span>
                    </div>
                    <span>Maestro</span>
                </div>
                <p className="eyebrow">Multitenant SaaS Boilerplate</p>
                <h1 className="hero-title">
                    Ship your SaaS,
                    <em> not your boilerplate.</em>
                </h1>
                <p className="subtitle">
                    Laravel 13 + Inertia 3, tenant isolation, RBAC, i18n,
                    themes, passkeys, and a clean product surface.
                </p>
            </div>

            <div
                className="hero-console"
                style={{
                    opacity: interpolate(frame, [62, 116], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                    translate: `${panelX}px 0`,
                }}
            >
                <div className="window-bar">
                    <span />
                    <span />
                    <span />
                    <code>tenant:acme</code>
                </div>
                <div className="console-status">
                    <div>
                        <p>Status</p>
                        <strong>Production ready</strong>
                    </div>
                    <b>live</b>
                </div>
                <div className="metric-grid">
                    <div>
                        <span>tenants</span>
                        <strong>128</strong>
                    </div>
                    <div>
                        <span>domains</span>
                        <strong>342</strong>
                    </div>
                    <div>
                        <span>roles</span>
                        <strong>24</strong>
                    </div>
                    <div>
                        <span>locales</span>
                        <strong>2</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};
