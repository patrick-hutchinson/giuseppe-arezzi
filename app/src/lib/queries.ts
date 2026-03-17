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
  acquisitions,
  clients,
  web,
  print[]{
    title,
    url,
    gallery[] ${mediaAssetFragment}
  },
  collaborators
}`;

export const projectsQuery = `*[_type=="project"]{
  _id,
  _type,
  year,
  title,
  credits,
  edition,
  description,
  gallery[] ${mediaAssetFragment},
  slug
}`;
