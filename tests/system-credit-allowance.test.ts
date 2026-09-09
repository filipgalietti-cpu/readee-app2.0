import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), topUp: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ rpc: mocks.rpc }) }));
vi.mock("@/lib/ai/credit-balance", () => ({ getTopUpBalance: mocks.topUp, spendTopUp: vi.fn() }));
import { checkRateLimit } from "@/lib/ai/readee-ai";

describe("system credit allowance", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
  it("allows both system identities when production uses different IDs", async () => {
    vi.stubEnv("QC_BOT_TEACHER_ID", "qc-system"); vi.stubEnv("DAILY_QUESTION_TEACHER_ID", "daily-system");
    for (const id of ["qc-system", "daily-system"]) expect((await checkRateLimit(id, "passage_generation")).allowed).toBe(true);
    expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.topUp).not.toHaveBeenCalled();
  });
  it("still reserves against an ordinary teacher's cap", async () => {
    vi.stubEnv("QC_BOT_TEACHER_ID", "qc-system"); vi.stubEnv("DAILY_QUESTION_TEACHER_ID", "daily-system");
    mocks.topUp.mockResolvedValue(0); mocks.rpc.mockResolvedValue({ data: { allowed: false, reason: "monthly", monthly_used: 500 }, error: null });
    expect((await checkRateLimit("teacher", "passage_generation")).allowed).toBe(false);
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_ai_credits", expect.objectContaining({ p_teacher: "teacher" }));
  });
});
