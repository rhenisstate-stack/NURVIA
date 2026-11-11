import { NotFoundPage } from "@/components/shared/feedback/NotFoundPage";

export default function NotFound() {
  return (
    <NotFoundPage
      title="404 — Page not found"
      message="Looks like this page has wandered outside the NURVIA learning environment. The page you're looking for may have been moved, removed, or may no longer be available."
      showDashboard={true}
      showBack={true}
    />
  );
}
