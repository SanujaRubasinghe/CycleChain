// admin/middleware.js
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Allow public auth pages (login & register)
      if (path.startsWith("/login") || path.startsWith("/register")) return true;

      // Admin area must be admin
      if (path.startsWith("/admin") || path.startsWith("/dashboard"))
        return !!token && token.role === "admin";

      // Everything else: require auth
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"], 
};
