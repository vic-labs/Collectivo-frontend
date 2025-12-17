import { MIST_PER_SUI } from "@mysten/sui/utils";
import { TRADEPORT_STORE_PACKAGE_ID, suiMainnetClient, SPECIAL_NFT_ROYALTIES, kioskClient } from "../constants";
import { bcs } from "@mysten/sui/bcs";
import { deriveDynamicFieldID } from "@mysten/sui/utils";
import { TransferPolicy } from "@mysten/kiosk";

async function findTransferPolicyWithRoyaltyRule({ nftType }: { nftType: string }): Promise<TransferPolicy | null> {
    const policies = await kioskClient.getTransferPolicies({ type: nftType });
    return policies.find(policy => policy.rules.some(rule => rule.includes('royalty_rule::Rule'))) || null;
}

export async function getTransferPolicyId({ nftType }: { nftType: string }): Promise<string | null> {
    try {
        const transferPolicyWithRoyalty = await findTransferPolicyWithRoyaltyRule({ nftType });

        if (transferPolicyWithRoyalty) {
            console.log("✅ Transfer policy with royalty found and returned");
            return transferPolicyWithRoyalty.id;
        }

        console.log("❌ Transfer policy with royalty not found");
        return null;
    } catch (e) {
        return null;
    }
}


export async function getNativeKioskListingPrice({
    nftId,
    nftType
}: {
    nftId: string,
    nftType: string
}) {
    try {
        // Step 1: Get kiosk (no longer need transferPolicyId here)
        const kioskId = await getKioskId(nftId);
        if (!kioskId) {
            console.error("❌ Missing kiosk", { kioskId });
            return undefined;
        }

        // Step 2: Fetch listing price (mist)
        const listingResponse = await suiMainnetClient.getDynamicFieldObject({
            parentId: kioskId,
            name: {
                type: '0x2::kiosk::Listing',
                value: { id: nftId, is_exclusive: true }
            }
        });

        if (!listingResponse.data?.content) {
            console.error("❌ Listing not found");
            return undefined;
        }

        const listingMist = parseInt((listingResponse.data.content as any).fields.value);
        if (!listingMist) return undefined;

        // Step 3: Get transfer policy and royalty info dynamically
        const transferPolicyWithRoyalty = await findTransferPolicyWithRoyaltyRule({ nftType });
        if (!transferPolicyWithRoyalty) {
            console.error("❌ No transfer policy with royalty rule found");
            return undefined;
        }

        // Step 4: Extract royalty package from actual policy
        const royaltyRule = transferPolicyWithRoyalty.rules.find(rule => rule.includes('royalty_rule::Rule'));
        if (!royaltyRule) {
            console.error("❌ Royalty rule not found in policy");
            return undefined;
        }
        const royaltyPackageId = royaltyRule.split('::')[0];

        // Step 5: Prepare royalty dynamic field ID with correct package and policy
        const ruleKeyType = `0x2::transfer_policy::RuleKey<${royaltyPackageId}::royalty_rule::Rule>`;
        const royaltyKey = bcs.struct(ruleKeyType, { dummy_field: bcs.bool() })
            .serialize({ dummy_field: false })
            .toBytes();

        const royaltyDfId = deriveDynamicFieldID(transferPolicyWithRoyalty.id, ruleKeyType, royaltyKey);

        // Step 6: Fetch royalty config
        const royaltyConfig = await suiMainnetClient.getObject({
            id: royaltyDfId,
            options: { showContent: true }
        });

        // Step 7: Calculate royalty (rest stays the same)
        let royaltyMist = 0;

        if (royaltyConfig.data) {
            const { amount_bp, min_amount } = (royaltyConfig.data.content as any).fields.value.fields;

            console.log({ amount_bp })

            royaltyMist = Math.max(
                Math.floor((listingMist * Number(amount_bp)) / 10_000),
                Number(min_amount)
            );
        } else {
            // Check for special NFT types with hardcoded royalties
            const specialNft = SPECIAL_NFT_ROYALTIES.find(nft => nft.type === nftType);
            if (specialNft) {
                royaltyMist = Math.floor((listingMist * specialNft.royaltyPercentage) / 100);
            }
        }

        // Platform fee (3%) in mist
        const platformFeeMist = Math.floor((listingMist * 3) / 100);

        // Final total mist
        const totalMist = listingMist + royaltyMist + platformFeeMist;

        console.log("Listing price details:");
        console.log({
            listingMist,
            royaltyMist,
            platformFeeMist,
            totalMist,
            transferPolicyId: transferPolicyWithRoyalty.id,
            royaltyPackageId,
            basisPoints: royaltyConfig.data ? (royaltyConfig.data.content as any).fields.value.fields.amount_bp : null,
            debug: {
                listingSui: Number(listingMist) / Number(MIST_PER_SUI),
                royaltySui: Number(royaltyMist) / Number(MIST_PER_SUI),
                platformFeeSui: Number(platformFeeMist) / Number(MIST_PER_SUI),
                totalSui: Number(totalMist) / Number(MIST_PER_SUI)
            }
        });

        return totalMist;

    } catch (err) {
        console.error("❌ getNativeKioskListingPrice error", err);
        return undefined;
    }
}




async function getKioskId(nftId: string) {
    const dynmicObjectWrapperRes = await suiMainnetClient.getObject({ id: nftId, options: { showOwner: true } });
    if (!dynmicObjectWrapperRes.data) {
        console.log("❌ Dynamic object wrapper not found");
        return undefined;
    }
    const owner = (dynmicObjectWrapperRes.data.owner as any)?.ObjectOwner;

    if (!owner) {
        console.log("❌ Owner not found");
        return undefined;
    }

    const fieldObjectRes = await suiMainnetClient.getObject({ id: owner, options: { showOwner: true } });
    const kioskId = (fieldObjectRes.data?.owner as any)?.ObjectOwner;
    if (!kioskId) {
        console.log("❌ Kiosk id not found");
        return undefined;
    }
    return kioskId;
}



export async function getTradeportListingPrice({ nftId }: { nftId: string }) {
    try {
        const field = await suiMainnetClient.getDynamicFieldObject({
            parentId: TRADEPORT_STORE_PACKAGE_ID,
            name: { type: '0x2::object::ID', value: nftId },
        });

        if (!field.data) {
            console.error('NFT is not listed on Tradeport');
            return undefined;
        }

        const fields = (field.data?.content as any)?.fields;
        if (fields?.price && fields?.commission) {
            const tradeportPrice = parseInt(fields.price) / Number(MIST_PER_SUI);
            const commission = parseInt(fields.commission) / Number(MIST_PER_SUI);
            return tradeportPrice + commission;
        } else {
            console.error('NFT is not listed on Tradeport');
            return undefined;
        }

    } catch (error) {
        console.error(error);
        return undefined;
    }
}