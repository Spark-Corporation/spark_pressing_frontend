import { Suspense } from "react";
import BilanPage from "./BilanPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <BilanPage />
    </Suspense>
  );
}
