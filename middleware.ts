import { neonAuthMiddleware } from "@neondatabase/neon-js/auth/next";

export default neonAuthMiddleware({
  // Redirects unauthenticated users to sign-in page
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/dashboard/:path*",
    "/api/prospects/:path*",
    "/api/routes/:path*",
    "/api/brands/:path*",
    "/api/coverage/:path*",
    "/api/opportunities/:path*",
  ],
};

