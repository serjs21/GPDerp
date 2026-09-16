import type { Decorator } from "@storybook/nextjs-vite";
import type { InfiniteData } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { MockAuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { CelestialAppShell } from "@/app/providers/CelestialAppShell";
import { CelestialThemeProvider } from "@/app/providers/CelestialThemeProvider";
import { HaikuFiltersProvider } from "@/app/providers/HaikuFiltersProvider";
import headerStyles from "@/app/providers/headerStyles.module.css";
import layoutStyles from "@/app/providers/layoutProviders.module.css";
import { AuthNavigation } from "@/components/AuthenticationNav/AuthNavigation";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import {
  HAIKU_LIST_PAGE_SIZE,
  haikuQueryKeys,
  type HaikuDto,
  type HaikuListSuccess,
} from "@/api/haikus";
import {
  getCelestialPresetDate,
  type CelestialPresetName,
} from "@/theme/celestialPresets";
import { dateToSlot } from "@/theme/celestialTime";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { createStoryQueryClient } from "../queryClient";
import { makeMockHaiku } from "../fixtures/haiku";
import { WISDOM_FOREST_BODIES } from "../fixtures/haikuBodies";
import { STORY_LOGGED_IN_AUTH } from "../fixtures/loggedInUser";

const APP_VIEW_SUBJECTS = [
  "Night questions",
  "Empty sky",
  "Winter pond",
  "Cherry blossoms",
  "Autumn wind",
  "Temple bell",
] as const;

export const STORY_APP_VIEW_HAIKUS: HaikuDto[] = WISDOM_FOREST_BODIES.map((body, index) =>
  makeMockHaiku({
    id: `app-view-haiku-${index + 1}`,
    title: APP_VIEW_SUBJECTS[index] ?? `Haiku ${index + 1}`,
    titleSuffix: 0,
    body,
    createdAt: new Date(Date.UTC(2026, 0, 15 - index, 12, 0, 0)).toISOString(),
  }),
);

function seedLoggedInHaikus() {
  const qc = createStoryQueryClient();
  const listKey = haikuQueryKeys.infiniteList(HAIKU_LIST_PAGE_SIZE);
  qc.setQueryDefaults(listKey, {
    staleTime: Infinity,
    gcTime: Infinity,
  });
  qc.setQueryData<InfiniteData<HaikuListSuccess, number>>(listKey, {
    pageParams: [0],
    pages: [
      {
        ok: true,
        data: {
          haikus: STORY_APP_VIEW_HAIKUS,
          total: STORY_APP_VIEW_HAIKUS.length,
          pageSize: HAIKU_LIST_PAGE_SIZE,
          offset: 0,
        },
      },
    ],
  });
  return qc;
}

function resolveInitialSlot(parameters: {
  initialSlot?: number;
  initialCelestialPreset?: CelestialPresetName;
}): number {
  if (parameters.initialCelestialPreset) {
    return dateToSlot(
      getCelestialPresetDate(parameters.initialCelestialPreset, BANGKOK_COORDINATES),
    );
  }
  return parameters.initialSlot ?? 48;
}

/**
 * Logged-in app chrome for Storybook: auth + seeded haikus + header/footer
 * around CelestialAppShell (same layout as the live home page).
 */
export const withLoggedInAppLayout: Decorator = (Story, { parameters }) => {
  const qc = seedLoggedInHaikus();
  const initialSlot = resolveInitialSlot(parameters);

  return (
    <QueryClientProvider client={qc}>
      <MockAuthenticationProvider value={STORY_LOGGED_IN_AUTH}>
        <AuthenticationVerificationProvider>
          <HaikuFiltersProvider>
            <CelestialThemeProvider initialSlot={initialSlot}>
              <CelestialAppShell
                className={layoutStyles.shell}
                footer={
                  <footer className={layoutStyles.footerSlot}>
                    <SiteFooter />
                  </footer>
                }
              >
                <header className={headerStyles.header}>
                  <div className={headerStyles.headerBar}>
                    <AuthNavigation />
                  </div>
                </header>
                <main className={layoutStyles.contentMain}>
                  <div className={layoutStyles.contentStretch}>
                    <Story />
                  </div>
                </main>
              </CelestialAppShell>
            </CelestialThemeProvider>
          </HaikuFiltersProvider>
        </AuthenticationVerificationProvider>
      </MockAuthenticationProvider>
    </QueryClientProvider>
  );
};
