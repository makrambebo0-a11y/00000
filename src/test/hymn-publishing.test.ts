import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), from: vi.fn(), storageFrom: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser }, rpc: mocks.rpc, from: mocks.from, storage: { from: mocks.storageFrom } } }));
import { hymnSubmission, removeHymn } from "@/lib/hymns";

const hymn = { id: "test-hymn", title: "ترنيمة", singer: null, lyrics: "كلمات", audio_path: null, status: "approved", created_at: "2026-11-02" };

describe("Hymn publishing permissions", () => {
  beforeEach(() => vi.resetAllMocks());

  it("publishes visitor submissions immediately without approval", () => {
    expect(hymnSubmission(" ترنيمة ", "", " كلمات ", null)).toEqual({ title: "ترنيمة", singer: null, lyrics: "كلمات", audio_path: null, status: "approved" });
  });

  it("blocks signed-out visitors from deleting", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(removeHymn(hymn)).rejects.toThrow("الحذف متاح لصاحب الموقع فقط.");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("blocks signed-in non-owners from deleting", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "visitor" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    await expect(removeHymn(hymn)).rejects.toThrow("الحذف متاح لصاحب الموقع فقط.");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("allows a verified owner to delete a hymn", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } }, error: null });
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    const select = vi.fn().mockResolvedValue({ data: [{ id: hymn.id }], error: null });
    const eq = vi.fn().mockReturnValue({ select });
    const remove = vi.fn().mockReturnValue({ eq });
    mocks.from.mockReturnValue({ delete: remove });
    await removeHymn(hymn);
    expect(mocks.rpc).toHaveBeenCalledWith("has_role", { _user_id: "owner", _role: "admin" });
    expect(eq).toHaveBeenCalledWith("id", "test-hymn");
  });
});