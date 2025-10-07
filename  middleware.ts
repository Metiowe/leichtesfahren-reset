// middleware.ts
export const config = {
  matcher: ["/((?!reset|api/reset).*)"], // protect everything EXCEPT these
};
