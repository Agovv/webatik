import { Easing, interpolate, useCurrentFrame } from 'remotion';
import '../styles.css';

const codeLines = [
    { tokens: [{ t: 'use', c: 'pink' }, { t: ' App\\Models\\Tenant;', c: 'text' }] },
    { tokens: [{ t: '', c: 'text' }] },
    { tokens: [{ t: '$tenant ', c: 'blue' }, { t: '= ', c: 'text' }, { t: 'Tenant::create', c: 'yellow' }, { t: '([', c: 'text' }] },
    { tokens: [{ t: "    'name' ", c: 'green' }, { t: '=> ', c: 'text' }, { t: "'Acme Corp'", c: 'orange' }, { t: ',', c: 'text' }] },
    { tokens: [{ t: ']);', c: 'text' }] },
    { tokens: [{ t: '', c: 'text' }] },
    { tokens: [{ t: '$tenant->domains()->create', c: 'yellow' }, { t: '([', c: 'text' }] },
    { tokens: [{ t: "    'domain' ", c: 'green' }, { t: '=> ', c: 'text' }, { t: "'acme.maestro.test'", c: 'orange' }, { t: ',', c: 'text' }] },
    { tokens: [{ t: ']);', c: 'text' }] },
];

const palette: Record<string, string> = {
    pink: '#f472b6',
    blue: '#60a5fa',
    yellow: '#fbbf24',
    green: '#4ade80',
    orange: '#fb923c',
    text: '#e5e5e5',
};

export const CodeScene = () => {
    const frame = useCurrentFrame();

    const lineReveal = (i: number) => {
        const delay = i * 4;
        const localFrame = Math.max(0, frame - delay);

        return Math.min(1, localFrame / 8);
    };

    return (
        <div className="scene scene-split code-scene">
            <div className="copy-stack">
                <p className="eyebrow">Code</p>
                <h2 className="title-plain">Provision a tenant in three lines.</h2>
                <p className="subtitle">
                    Domain identified. Database cloned. Migrations run.
                </p>
            </div>
            <div className="code-window">
                <div className="window-bar">
                    <span />
                    <span />
                    <span />
                    <code>routes/starter.php</code>
                </div>
                <code className="code-body">
                {codeLines.map((line, i) => {
                    const appear = lineReveal(i);
                    const translateX = interpolate(appear, [0, 1], [18, 0], {
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                    });

                    return (
                        <div
                            key={i}
                            style={{
                                opacity: appear,
                                translate: `${translateX}px 0`,
                            }}
                        >
                            {line.tokens.map((tok, j) => (
                                <span
                                    key={j}
                                    style={{ color: palette[tok.c] ?? '#e5e5e5' }}
                                >
                                    {tok.t}
                                </span>
                            ))}
                        </div>
                    );
                })}
                </code>
            </div>
        </div>
    );
};
