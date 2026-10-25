import { GuestProductIntro } from "@/components/GuestProductIntro";
import { HomePageContent } from "./HomePageContent";

/** Without JS the first-load loader never lifts; show the product summary instead. */
const NO_SCRIPT_HIDE_LOADER = "[data-html-loader]{display:none!important}";

export default function Home() {
  return (
    <>
      <noscript>
        <style>{NO_SCRIPT_HIDE_LOADER}</style>
        <GuestProductIntro />
      </noscript>
      <HomePageContent />
    </>
  );
}
