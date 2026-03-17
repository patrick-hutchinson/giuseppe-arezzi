import HomePage from "./Home";

import { getSite, getHome, getProjects } from "@/lib/fetch";

export default async function Page() {
  const [site] = await Promise.all([getSite()]);
  const [home] = await Promise.all([getHome()]);
  const [projects] = await Promise.all([getProjects()]);

  return <HomePage site={site} home={home} projects={projects} />;
}
