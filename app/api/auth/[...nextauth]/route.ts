import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path to your lib/auth is correct

const handler = NextAuth(authOptions);

// NextAuth needs to handle both GET (for session/providers) 
// and POST (for signin/callback) requests.
export { handler as GET, handler as POST };