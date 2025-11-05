import { MIST_PER_SUI } from "@mysten/sui/utils";
import { ROYALTY_RULE_PACKAGE_ID, TRADEPORT_STORE_PACKAGE_ID, suiMainnetClient } from "../constants";
import { bcs } from "@mysten/sui/bcs";
import { deriveDynamicFieldID } from "@mysten/sui/utils";
import { mistToSui } from ".";



export async function getTransferPolicyId({ nftType }: { nftType: string }): Promise<string | null> {
    try {
        const eventType = `0x2::transfer_policy::TransferPolicyCreated<${nftType}>`;
        const response = await suiMainnetClient.queryEvents({
            query: { MoveEventType: eventType },
            limit: 1,
        });

        if (response.data.length > 0) {
            const policyId = (response.data[0].parsedJson as any)?.id;
            console.log("✅ Transfer policy id found and returned");
            return policyId || null;
        }


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
        // Step 1: Get transfer policy + kiosk
        const [transferPolicyId, kioskId] = await Promise.all([
            getTransferPolicyId({ nftType }),
            getKioskId(nftId)
        ]);

        if (!transferPolicyId || !kioskId) {
            console.error("❌ Missing transfer policy or kiosk", { transferPolicyId, kioskId });
            return undefined;
        }

        // Step 2: Fetch listing price (mist)
        const listingPromise = suiMainnetClient.getDynamicFieldObject({
            parentId: kioskId,
            name: {
                type: '0x2::kiosk::Listing',
                value: { id: nftId, is_exclusive: true }
            }
        });

        // Step 3: Prepare royalty dynamic field ID
        const ruleKeyType = `0x2::transfer_policy::RuleKey<${ROYALTY_RULE_PACKAGE_ID}::royalty_rule::Rule>`;
        const royaltyKey = bcs.struct(ruleKeyType, { dummy_field: bcs.bool() })
            .serialize({ dummy_field: false })
            .toBytes();

        const royaltyDfId = deriveDynamicFieldID(transferPolicyId, ruleKeyType, royaltyKey);

        // Step 4: Fetch royalty config
        const royaltyPromise = suiMainnetClient.getObject({
            id: royaltyDfId,
            options: { showContent: true }
        });

        // Step 5: Await both
        const [listingResponse, royaltyConfig] = await Promise.all([listingPromise, royaltyPromise]);

        // Step 6: Extract listing price in mist
        const listingMist = parseInt((listingResponse.data!.content as any).fields.value);
        if (!listingMist) return undefined;

        // Step 7: Calculate royalty in mist
        let royaltyMist = 0;

        if (royaltyConfig.data) {
            const { amount_bp, min_amount } = (royaltyConfig.data.content as any).fields.value.fields;

            royaltyMist = Math.max(
                Math.floor((listingMist * Number(amount_bp)) / 10_000),
                Number(min_amount)
            );
        }

        // Platform fee (3%) in mist
        const platformFeeMist = Math.floor((listingMist * 3) / 100);

        // Final total mist
        const totalMist = listingMist + royaltyMist + platformFeeMist;

        console.log({
            listingMist,
            royaltyMist,
            platformFeeMist,
            totalMist,
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
        return undefined;
    }
    const owner = (dynmicObjectWrapperRes.data.owner as any)?.ObjectOwner;

    if (!owner) {
        return undefined;
    }

    const fieldObjectRes = await suiMainnetClient.getObject({ id: owner, options: { showOwner: true } });
    const kioskId = (fieldObjectRes.data?.owner as any)?.ObjectOwner;
    if (!kioskId) {
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