import HomePage from "./Home";

import { getSite, getHome } from "@/lib/fetch";

export default async function Page() {
  const [site] = await Promise.all([getSite()]);
  const [home] = await Promise.all([getHome()]);

  return <HomePage site={site} home={home} />;
}
