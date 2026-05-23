import { projectSchema, type Project, type ProjectInput } from "./types";

export async function createProject(data: ProjectInput): Promise<Project> {
  return projectSchema.parse(data);
}

export async function updateProjectStatus(id: string, status: Project["status"]): Promise<{ id: string; status: string }> {
  return { id, status };
}
