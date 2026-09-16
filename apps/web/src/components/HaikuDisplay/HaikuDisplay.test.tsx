import React from "react";
import { render, screen } from "@testing-library/react";
import { HaikuDisplay } from "./HaikuDisplay";

jest.mock("@/components/CreationModal", () => ({
  CreationModal: () => null,
}));

jest.mock("@/components/SavedHaikusLanternPath/SavedHaikusLanternPath", () => ({
  SavedHaikusLanternPath: () => <div data-testid="lantern-path" />,
}));

jest.mock("@/components/StoneInput", () => ({
  StoneInput: () => <div data-testid="stone-input" />,
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
  useHaikuFilters: () => ({ searchString: "", selectedLabelIds: [] }),
}));

describe("HaikuDisplay", () => {
  it("renders the lantern path and stone input shell", () => {
    render(<HaikuDisplay />);

    expect(screen.getByTestId("lantern-path")).toBeInTheDocument();
    expect(screen.getByTestId("stone-input")).toBeInTheDocument();
  });
});
