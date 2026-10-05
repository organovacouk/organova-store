import { getCloudflareContext } from "@opennextjs/cloudflare";
export const env = () => getCloudflareContext().env;
export const db = () => env().DB;
export const gbp = (p) => "£" + (p / 100).toFixed(2);
