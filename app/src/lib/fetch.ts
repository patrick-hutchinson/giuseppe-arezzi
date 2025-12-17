import { client } from "./client";
import { siteQuery, homeQuery } from "./queries";

export async function getSite() {
  return client.fetch(siteQuery);
}

export async function getHome() {
  return client.fetch(homeQuery);
}
