import { GuestProductIntro } from "@/components/GuestProductIntro";
import { HomePageContent } from "./HomePageContent";

export default function Home() {
  return (
    <>
      {/* Main renders on the client after auth resolves; crawlers without JS get the product summary. */}
      <noscript>
        <GuestProductIntro />
      </noscript>
      <HomePageContent />
    </>
  );
}
