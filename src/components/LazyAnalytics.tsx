import { useEffect, useState } from "react";

export default function LazyAnalytics() {
    const [elements, setElements] = useState<JSX.Element[]>([]);

    useEffect(() => {
        let active = true;
        // Defer the heavy third-party analytics bundles until after initial paint
        // by dynamically importing them on the client.
        Promise.all([
            import("@vercel/analytics/react"),
            import("@vercel/speed-insights/react"),
        ]).then(([analyticsMod, speedMod]) => {
            if (!active) return;
            const comps: JSX.Element[] = [];
            if (analyticsMod.Analytics) {
                const Analytics = analyticsMod.Analytics;
                comps.push(<Analytics key="analytics" />);
            }
            if (speedMod.SpeedInsights) {
                const SpeedInsights = speedMod.SpeedInsights;
                comps.push(<SpeedInsights key="speed" />);
            }
            setElements(comps);
        });
        return () => {
            active = false;
        };
    }, []);

    return <>{elements}</>;
}
