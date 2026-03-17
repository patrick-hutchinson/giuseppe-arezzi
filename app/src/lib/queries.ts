import { mediaAssetFragment } from "./fragments";

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
  introduction,
  awards,
  clients,
  press
}`;

export const projectsQuery = `*[_type=="project"]{
  _id,
  _type,
  year,
  title,
  edition,
  description,
  gallery[] ${mediaAssetFragment},
  slug
}`;
