import { Suspense } from "react";
import ValidateClient from "./ValidateClient";

export default function ValidatePage() {
    return (
        <Suspense fallback={null}>
            <ValidateClient />
        </Suspense>
    );
}