import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiRequest = vi.hoisted(() => vi.fn());

vi.mock("@/src/shared/api-client", () => ({
  apiRequest: mockApiRequest,
}));

import { projects, projectLimits, projectDetail, createProject, updateProject, projectArtifacts, projectDownload, projectUsage, deleteProject } from "@/src/features/auth/projects-api";

describe("projects-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("projects calls apiRequest with /projects", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    const result = await projects();
    expect(mockApiRequest).toHaveBeenCalledWith("/projects");
    expect(result).toEqual([]);
  });

  it("projectLimits calls apiRequest with /projects/limits", async () => {
    mockApiRequest.mockResolvedValueOnce({ max_projects: 5 });
    const result = await projectLimits();
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/limits");
    expect(result).toEqual({ max_projects: 5 });
  });

  it("projectDetail calls apiRequest with /projects/:id", async () => {
    mockApiRequest.mockResolvedValueOnce({ id: "p1" });
    const result = await projectDetail("p1");
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1");
    expect(result).toEqual({ id: "p1" });
  });

  it("createProject calls apiRequest with POST", async () => {
    const payload = { name: "test", description: "desc" };
    mockApiRequest.mockResolvedValueOnce({ id: "p1" });
    const result = await createProject(payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/projects", { method: "POST", body: payload });
    expect(result).toEqual({ id: "p1" });
  });

  it("updateProject calls apiRequest with PATCH", async () => {
    const payload = { name: "updated" };
    mockApiRequest.mockResolvedValueOnce({ id: "p1", name: "updated" });
    const result = await updateProject("p1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1", { method: "PATCH", body: payload });
    expect(result).toEqual({ id: "p1", name: "updated" });
  });

  it("projectArtifacts calls apiRequest with /projects/:id/artifacts", async () => {
    mockApiRequest.mockResolvedValueOnce([]);
    const result = await projectArtifacts("p1");
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1/artifacts");
    expect(result).toEqual([]);
  });

  it("projectDownload calls apiRequest with /projects/:id/download", async () => {
    mockApiRequest.mockResolvedValueOnce({ url: "https://example.com" });
    const result = await projectDownload("p1");
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1/download");
    expect(result).toEqual({ url: "https://example.com" });
  });

  it("projectUsage calls apiRequest with /projects/:id/usage", async () => {
    mockApiRequest.mockResolvedValueOnce({ credits_used: 100 });
    const result = await projectUsage("p1");
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1/usage");
    expect(result).toEqual({ credits_used: 100 });
  });

  it("deleteProject calls apiRequest with DELETE", async () => {
    const payload = { confirmation: "delete" };
    mockApiRequest.mockResolvedValueOnce({ message: "Deleted" });
    const result = await deleteProject("p1", payload);
    expect(mockApiRequest).toHaveBeenCalledWith("/projects/p1", { method: "DELETE", body: payload });
    expect(result).toEqual({ message: "Deleted" });
  });
});
