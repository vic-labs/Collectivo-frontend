import { SuiCodegenConfig } from "@mysten/codegen";


const config: SuiCodegenConfig = {
    output: './src/contract-sdk',
    generateSummaries: true,
    prune: true,
    packages: [
        {
            package: '@local-pkg/collectivo',
            path: '/Users/user/Desktop/SUI-MOVE/collectivo/smart-contract/collectivo',
        },
    ],
};

export default config;


