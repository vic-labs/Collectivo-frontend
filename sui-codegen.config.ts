import { SuiCodegenConfig } from "@mysten/codegen";


const config: SuiCodegenConfig = {
    output: './src/contract-sdk',
    generateSummaries: true,
    prune: true,
    packages: [
        {
            package: '@local-pkg/lets-own',
            path: '/Users/user/Desktop/SUI-MOVE/lets-own/smart-contract/collectivo',
        },
    ],
};

export default config;


