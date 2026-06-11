import {
  blockUser,
  submitUserReport,
  type SubmitUserReportInput,
} from "../api/safetyApi";

export type ReportSafetyConcernInput = SubmitUserReportInput & {
  blockAfterReport?: boolean;
};

export type ReportSafetyConcernResult = {
  success: boolean;
  reportSent: boolean;
  blocked: boolean;
  error?: string;
  blockError?: string;
};

export async function reportSafetyConcern({
  blockAfterReport = false,
  ...reportInput
}: ReportSafetyConcernInput): Promise<ReportSafetyConcernResult> {
  const reportResult = await submitUserReport(reportInput);

  if (!reportResult.success) {
    return {
      success: false,
      reportSent: false,
      blocked: false,
      error:
        reportResult.error ||
        "The report was not sent. Check your connection and try again. You can still block or unmatch from the chat if you need to stop contact now.",
    };
  }

  if (!blockAfterReport) {
    return {
      success: true,
      reportSent: true,
      blocked: false,
    };
  }

  const blockResult = await blockUser(reportInput.reportedUserId);

  if (!blockResult.success) {
    return {
      success: true,
      reportSent: true,
      blocked: false,
      blockError:
        blockResult.error ||
        "The report was sent, but blocking did not finish. Try blocking again from the chat or profile screen if you need contact to stop.",
    };
  }

  return {
    success: true,
    reportSent: true,
    blocked: true,
  };
}
