import React, { useRef, useEffect, useState } from "react";

import { DosFactoryType, DosInstance } from "emulators-ui/dist/types/js-dos";

declare const Dos: DosFactoryType;

interface PlayerProps {
    bundleUrl: string;
}

export default function DosPlayer(props: PlayerProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [dos, setDos] = useState<DosInstance | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;

        const instance = Dos(root, {
            emulatorFunction: "dosWorker",
        });

        setDos(instance);

        return () => {
            instance.stop();
        };
    }, [rootRef]);

    useEffect(() => {
        if (dos !== null) {
            dos.run(props.bundleUrl); // ci is returned
        }
    }, [dos, props.bundleUrl]);

    return <div ref={rootRef} style={{ width: "100%", height: "100%" }}>
    </div>;
}