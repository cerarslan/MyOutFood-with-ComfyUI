import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import InstagramProvider from "next-auth/providers/instagram";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

const handler = NextAuth({
  debug: process.env.NEXTAUTH_DEBUG === 'true', // Hata ayıklama modunu açıyoruz
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID ?? "",
      clientSecret: process.env.FACEBOOK_SECRET ?? "",
    }),
    TwitterProvider({
      clientId: process.env.XTWITTER_ID ?? "",
      clientSecret: process.env.XTWITTER_SECRET ?? "",
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "users.read tweet.read",
        }
      },
      profile({ data }) {
        return {
          id: data.id,
          name: data.name,
          email: null,
          image: data.profile_image_url
        }
      }
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_ID ?? "",
      clientSecret: process.env.INSTAGRAM_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    error: '/login', // Hata durumunda login sayfasına yönlendir
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Eğer URL zaten baseUrl ile başlıyorsa (yani uygulamamızın bir parçasıysa), o URL'i kullan
      if (url.startsWith(baseUrl)) return url;
      // Eğer URL bir göreceli yol ise (/ ile başlıyorsa), baseUrl ile birleştir
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Diğer tüm durumlarda ana sayfaya yönlendir
      return baseUrl;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
