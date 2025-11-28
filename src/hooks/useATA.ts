import { setupTypeAcquisition } from '@typescript/ata';
import * as ts from 'typescript';

export const useATA = () => {
    const createATA = (addLibrary: (path: string, content: string) => void) => {
        const ata = setupTypeAcquisition({
            projectName: 'livepair-project',
            typescript: ts,
            logger: console,
            delegate: {
                receivedFile: (code: string, path: string) => {
                    // console.log('Received type:', path);
                    addLibrary(path, code);
                },
                progress: (_downloaded: number, _total: number) => {
                    // console.log(`ATA Progress: ${downloaded}/${total}`);
                },
                started: () => {
                    // console.log('ATA started');
                },
                finished: (_files: Map<string, string>) => {
                    // console.log('ATA finished', files.size);
                },
            },
        });

        return ata;
    };

    return { createATA };
};
