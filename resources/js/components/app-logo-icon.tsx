import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 48V17h9.2L32 31.1 41.8 17H51v31h-9V31.7l-7.1 10.1h-5.8L22 31.7V48h-9Z" />
            <path d="M49.5 8 51 13.1l5 1.4-5 1.5-1.5 5-1.5-5-5-1.5 5-1.4L49.5 8Z" />
        </svg>
    );
}
