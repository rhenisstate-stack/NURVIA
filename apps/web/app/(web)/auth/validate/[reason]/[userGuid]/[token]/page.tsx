import { Suspense } from "react";
import ValidateClient from "../../../ValidateClient";

export default async function ValidateLinkPage({
    params,
}: {
    params: Promise<{ reason: string; userGuid: string; token: string }>;
}) {
    const { reason, userGuid, token } = await params;
    return (
        <Suspense fallback={null}>
            <ValidateClient reason={reason} userGuid={userGuid} token={token} />
        </Suspense>
    );
}