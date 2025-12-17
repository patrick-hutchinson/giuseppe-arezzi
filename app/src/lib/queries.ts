export const siteQuery = `*[_type=="site"][0]{
  title,
  googleDescription,
  email,
  socials[]{
    platform,
    link
  },
}`;

export const homeQuery = `*[_type=="home"][0]{
  announcement
}`;
