import { blockUser, submitUserReport } from "../../api/safetyApi";
import { reportSafetyConcern } from "../reportSafetyConcern";

jest.mock("../../api/safetyApi", () => ({
  blockUser: jest.fn(),
  submitUserReport: jest.fn(),
}));

const baseInput = {
  reportedUserId: "22222222-2222-4222-8222-222222222222",
  reason: "Harassment or abusive messages",
  details: "Sent repeated insults",
  conversationId: "33333333-3333-4333-8333-333333333333",
  source: "chat" as const,
};

describe("reportSafetyConcern", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the report error and does not block when report submission fails", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({
      success: false,
      error: "Report rejected",
    });

    const result = await reportSafetyConcern({
      ...baseInput,
      blockAfterReport: true,
    });

    expect(result).toEqual({
      success: false,
      reportSent: false,
      blocked: false,
      error: "Report rejected",
    });
    expect(submitUserReport).toHaveBeenCalledWith(baseInput);
    expect(blockUser).not.toHaveBeenCalled();
  });

  it("submits the report without blocking when blockAfterReport is false", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });

    const result = await reportSafetyConcern(baseInput);

    expect(result).toEqual({
      success: true,
      reportSent: true,
      blocked: false,
    });
    expect(submitUserReport).toHaveBeenCalledWith(baseInput);
    expect(blockUser).not.toHaveBeenCalled();
  });

  it("submits the report and blocks the member when requested", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });
    (blockUser as jest.Mock).mockResolvedValue({ success: true });

    const result = await reportSafetyConcern({
      ...baseInput,
      blockAfterReport: true,
    });

    expect(result).toEqual({
      success: true,
      reportSent: true,
      blocked: true,
    });
    expect(blockUser).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
    );
  });

  it("keeps the report successful when blocking fails", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });
    (blockUser as jest.Mock).mockResolvedValue({
      success: false,
      error: "Block failed",
    });

    const result = await reportSafetyConcern({
      ...baseInput,
      blockAfterReport: true,
    });

    expect(result).toEqual({
      success: true,
      reportSent: true,
      blocked: false,
      blockError: "Block failed",
    });
  });
});
