import { feedResponse } from "@/lib/feed";

// Required for `output: export` — emit a static feed at build time.
export const dynamic = "force-static";

/** The English feed. Lives under `/en` like every other English URL. */
export function GET(): Response {
  return feedResponse("en");
}
