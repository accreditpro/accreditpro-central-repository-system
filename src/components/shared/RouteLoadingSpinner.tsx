/**
 * RouteLoadingSpinner — A full-page loading indicator shown while auth state
 * is being determined on app startup or during route transitions.
 *
 * Renders a centered spinner with a subtle pulse animation and message.
 * Used by AppInitializer, ProtectedRoute, and PublicRoute to prevent
 * premature redirects before the persisted session is restored.
 */

interface RouteLoadingSpinnerProps {
  /** Optional message shown below the spinner. Defaults to "Loading…" */
  message?: string;
}

export const RouteLoadingSpinner = ({ message = 'Loading…' }: RouteLoadingSpinnerProps) => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
    </div>
  </div>
);
