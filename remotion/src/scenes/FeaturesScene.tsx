import { Easing, interpolate, useCurrentFrame } from 'remotion';
import '../styles.css';

const features = [
    { icon: 'DB', title: 'Tenant isolation', desc: 'Own database, own scope' },
    { icon: 'RB', title: 'RBAC', desc: 'Roles and permissions ready' },
    { icon: 'ID', title: 'International', desc: 'ICU messages, EN / ES' },
    { icon: '2F', title: 'Passkeys + 2FA', desc: 'Fortify, WebAuthn, TOTP' },
];

export const FeaturesScene = () => {
    const frame = useCurrentFrame();

    return (
        <div className="scene scene-column">
            <div className="section-heading">
                <p className="eyebrow">Features</p>
                <h2 className="title-plain">Everything you need to launch.</h2>
                <p className="subtitle">
                    Four production concerns handled before your first tenant
                    signs in.
                </p>
            </div>
            <div className="feature-lanes">
                {features.map((f, i) => {
                    const delay = 24 + i * 14;
                    const localFrame = Math.max(0, frame - delay);
                    const appear = interpolate(localFrame, [0, 22], [0, 1], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                    });

                    return (
                        <div
                            key={f.title}
                            className="feature-lane"
                            style={{
                                opacity: appear,
                                translate: `0 ${(1 - appear) * 26}px`,
                            }}
                        >
                            <span className="feature-icon">{f.icon}</span>
                            <div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
