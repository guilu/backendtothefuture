import { feedResponse } from "@/lib/feed";

// Required for `output: export` — emit a static feed.xml at build time.
export const dynamic = "force-static";

/** The Spanish feed, at the address subscribers already use. */
export function GET(): Response {
  return feedResponse("es");
}
