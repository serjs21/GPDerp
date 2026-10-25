import React from "react";
import { render, screen } from "@testing-library/react";
import { HaikuDisplay } from "./HaikuDisplay";

let mockEmailVerifiedAt: string | null = "2026-01-01T00:00:00.000Z";

jest.mock("@/app/providers/AuthenticationProvider", () => ({
  useAuthenticationState: () => ({ user: { emailVerifiedAt: mockEmailVerifiedAt } }),
}));

jest.mock("./EmailVerificationView", () => ({
  EmailVerificationView: () => <div data-testid="email-verification-view" />,
}));

jest.mock("@/components/CreationModal", () => ({
  CreationModal: () => null,
}));

jest.mock("@/components/SavedHaikusLanternPath/SavedHaikusLanternPath", () => ({
  SavedHaikusLanternPath: () => <div data-testid="lantern-path" />,
}));

jest.mock("@/components/PostSignInput", () => ({
  PostSignInput: () => <div data-testid="post-sign-input" />,
}));

jest.mock("@/hooks/useHaikuDeleteController", () => ({
  useHaikuDeleteController: () => ({
    onHaikuDeleted: jest.fn(),
    onHaikuDeleteFailed: jest.fn(),
    deleteFailedModal: null,
  }),
}));

jest.mock("@/hooks/useInfiniteHaikusQuery", () => ({
  useInfiniteHaikusQuery: () => ({ invalidate: jest.fn() }),
}));

jest.mock("@/components/HaikuGenerationStickyNote/hooks/useCreationPathGate", () => ({
  useCreationPathGate: () => ({
    creationOpen: false,
    creationHaiku: null,
    creationSessionKey: 0,
    modalGeneratingDraft: null,
    onKeepScrolling: jest.fn(),
    onGoToHaiku: jest.fn(),
    onCreationHaikuDeleted: jest.fn(),
    bindHaikuSaved: jest.fn(),
  }),
}));

jest.mock("@/components/HaikuGenerationStickyNote/hooks/useHaikuGenerationFlow", () => ({
  useHaikuGenerationFlow: () => ({
    subject: "",
    setSubject: jest.fn(),
    isLoading: false,
    generatingDraft: null,
    inputRef: { current: null },
    onSubmit: jest.fn(),
  }),
}));

jest.mock("@/app/providers/HaikuFiltersProvider", () => ({
  useHaikuFilters: () => ({
    searchString: "",
    selectedLabelIds: [],
    excludedLabelIds: [],
    orderSort: { categoryId: null, direction: "asc" },
  }),
}));

describe("HaikuDisplay", () => {
  it("renders the lantern path and post-sign input shell for a verified account", () => {
    mockEmailVerifiedAt = "2026-01-01T00:00:00.000Z";
    render(<HaikuDisplay />);

    expect(screen.getByTestId("lantern-path")).toBeInTheDocument();
    expect(screen.getByTestId("post-sign-input")).toBeInTheDocument();
    expect(screen.queryByTestId("email-verification-view")).not.toBeInTheDocument();
  });

  it("shows only the verification view (no path, no input) until the email is verified", () => {
    mockEmailVerifiedAt = null;
    render(<HaikuDisplay />);

    expect(screen.getByTestId("email-verification-view")).toBeInTheDocument();
    expect(screen.queryByTestId("lantern-path")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-sign-input")).not.toBeInTheDocument();
  });
});
