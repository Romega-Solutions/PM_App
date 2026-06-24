import { blockUser, submitUserReport } from "../../api/safetyApi";
import { reportSafetyConcern } from "../reportSafetyConcern";

jest.mock("../../api/safetyApi", () => ({
  blockUser: jest.fn(),
  submitUserReport: jest.fn(),
}));

const baseReportInput = {
  reportedUserId: "11111111-1111-4111-8111-111111111111",
  reason: "Harassment or abusive messages",
  details: "Repeated unwanted pressure.",
  conversationId: "22222222-2222-4222-8222-222222222222",
  source: "chat" as const,
};

describe("reportSafetyConcern", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not attempt blocking when the report fails", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({
      success: false,
      error: "The report was not sent. Check your connection and try again.",
    });

    await expect(
      reportSafetyConcern({ ...baseReportInput, blockAfterReport: true }),
    ).resolves.toEqual({
      success: false,
      reportSent: false,
      blocked: false,
      error: "The report was not sent. Check your connection and try again.",
    });

    expect(submitUserReport).toHaveBeenCalledWith(baseReportInput);
    expect(blockUser).not.toHaveBeenCalled();
  });

  it("records a report without blocking when blockAfterReport is disabled", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });

    await expect(reportSafetyConcern(baseReportInput)).resolves.toEqual({
      success: true,
      reportSent: true,
      blocked: false,
    });

    expect(blockUser).not.toHaveBeenCalled();
  });

  it("blocks the reported member only after the report succeeds", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });
    (blockUser as jest.Mock).mockResolvedValue({ success: true });

    await expect(
      reportSafetyConcern({ ...baseReportInput, blockAfterReport: true }),
    ).resolves.toEqual({
      success: true,
      reportSent: true,
      blocked: true,
    });

    expect(blockUser).toHaveBeenCalledWith(baseReportInput.reportedUserId);
  });

  it("keeps the report recorded when block retry is needed", async () => {
    (submitUserReport as jest.Mock).mockResolvedValue({ success: true });
    (blockUser as jest.Mock).mockResolvedValue({
      success: false,
      error: "Block failed. Check your connection and try again.",
    });

    await expect(
      reportSafetyConcern({ ...baseReportInput, blockAfterReport: true }),
    ).resolves.toEqual({
      success: true,
      reportSent: true,
      blocked: false,
      blockError: "Block failed. Check your connection and try again.",
    });
  });
});
