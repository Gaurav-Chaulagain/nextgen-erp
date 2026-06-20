"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectStats } from "./ProjectStats";
import { ProjectsTable } from "./ProjectsTable";
import { CreateProjectModal } from "./CreateProjectModal";
import { IssueSupplyModal } from "./IssueSupplyModal";
import { ProjectProfitabilityReport } from "./ProjectProfitabilityReport";
import type { ProjectStatsSchema, ProjectProfitabilitySchema } from "@/modules/projects/types";

interface ProjectsClientProps {
  stats: ProjectStatsSchema;
  activeProjects: ProjectProfitabilitySchema[];
  activePagination: { page: number; pageSize: number; total: number };
  allProjects: ProjectProfitabilitySchema[];
  allPagination: { page: number; pageSize: number; total: number };
  pnlProjects: ProjectProfitabilitySchema[];
  pnlPagination: { page: number; pageSize: number; total: number };
  currentTab: string;
  searchQuery: string;
  lookups: {
    clients: Array<{ id: string; name: string; code: string; customerType: string }>;
    products: any[];
    warehouses: Array<{ id: string; name: string }>;
  };
}

export function ProjectsClient({
  stats,
  activeProjects,
  activePagination,
  allProjects,
  allPagination,
  pnlProjects,
  pnlPagination,
  currentTab,
  searchQuery,
  lookups,
}: ProjectsClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{ id: string; name: string; clientId: string; clientName: string } | null>(null);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const tab = (currentTab ?? "active") as "active" | "all" | "pnl";

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Projects Board</h2>
          <p className="text-sm text-zinc-500">Track site dispatches, contracts, and profitability ratios.</p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setShowCreate(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + New Project
        </Button>
      </div>

      <ProjectStats stats={stats} />

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2 dark:border-zinc-800">
        <Link
          href="/projects?tab=active"
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "active"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          }`}
        >
          Active Projects ({stats.activeCount})
        </Link>
        <Link
          href="/projects?tab=all"
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          }`}
        >
          All Projects ({allPagination.total})
        </Link>
        <Link
          href="/projects?tab=pnl"
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "pnl"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          }`}
        >
          Project Profitability (P&L)
        </Link>
      </div>

      {tab === "active" && (
        <ProjectsTable
          projects={activeProjects}
          pagination={activePagination}
          searchQuery={searchQuery}
          onIssueSupply={(proj) => {
            setSelectedProject(proj);
            setShowIssue(true);
          }}
          onEdit={handleEdit}
        />
      )}

      {tab === "all" && (
        <ProjectsTable
          projects={allProjects}
          pagination={allPagination}
          searchQuery={searchQuery}
          onIssueSupply={(proj) => {
            setSelectedProject(proj);
            setShowIssue(true);
          }}
          onEdit={handleEdit}
        />
      )}

      {tab === "pnl" && (
        <ProjectProfitabilityReport
          projects={pnlProjects}
          pagination={pnlPagination}
          searchQuery={searchQuery}
        />
      )}

      {/* Create / Edit Project Modal */}
      <CreateProjectModal
        open={showCreate}
        onOpenChange={setShowCreate}
        clients={lookups.clients}
        project={editingProject}
      />

      {/* Issue Supply Modal */}
      {selectedProject && (
        <IssueSupplyModal
          open={showIssue}
          onOpenChange={setShowIssue}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          clientName={selectedProject.clientName}
          products={lookups.products}
          warehouses={lookups.warehouses}
        />
      )}
    </div>
  );
}
