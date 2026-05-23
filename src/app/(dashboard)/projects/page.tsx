import React from "react";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { StatusBadge } from "../../../components/shared/StatusBadge";
import { NPRAmount } from "../../../components/shared/NPRAmount";
import { Briefcase, Calendar, MapPin, DollarSign, Hammer } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  client: string;
  location: string;
  budget: number;
  progress: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  materialsTracked: number;
}

const mockProjects: ProjectItem[] = [
  {
    id: "PRJ-2026-001",
    name: "Gauradaha Commercial Complex Waterproofing",
    client: "Jhapa Development Authority",
    location: "Gauradaha-02, Jhapa",
    budget: 850000.0,
    progress: 75,
    status: "ACTIVE",
    startDate: "2026-01-15",
    materialsTracked: 140,
  },
  {
    id: "PRJ-2026-002",
    name: "Nischal Timsina Villa Interior",
    client: "Nischal Timsina",
    location: "Damak, Jhapa",
    budget: 1250000.0,
    progress: 40,
    status: "ACTIVE",
    startDate: "2026-03-01",
    materialsTracked: 310,
  },
  {
    id: "PRJ-2026-003",
    name: "Gauradaha School Paint & Renovation",
    client: "Gauradaha Municipality Office",
    location: "Gauradaha-01, Jhapa",
    budget: 450000.0,
    progress: 100,
    status: "COMPLETED",
    startDate: "2025-10-10",
    materialsTracked: 95,
  },
  {
    id: "PRJ-2026-004",
    name: "Bhadrapur Warehouse Flooring",
    client: "Pathibhara Distributors",
    location: "Bhadrapur, Jhapa",
    budget: 1800000.0,
    progress: 5,
    status: "DRAFT",
    startDate: "2026-06-01",
    materialsTracked: 0,
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Project Management"
        description="Track site operations, waterproofing jobs, materials allocation, and client budgets."
      />

      {/* Mini Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Active Projects</CardTitle>
            <div className="p-2.5 rounded-xl text-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">2</div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Currently running site installations</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cumulative Project Budgets</CardTitle>
            <div className="p-2.5 rounded-xl text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <NPRAmount amount={4350000.0} />
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Total revenue value from 4 contracts</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-100 shadow-sm rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Materials Allocation</CardTitle>
            <div className="p-2.5 rounded-xl text-purple-500 bg-purple-50 dark:bg-purple-950/20">
              <Hammer className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">545 Units</div>
            <p className="text-xs text-zinc-400 font-medium mt-1">Cement bags, PVC pipes & paint dispatched</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid gap-6 md:grid-cols-2">
        {mockProjects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col justify-between bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-zinc-100/60 dark:border-zinc-800/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">
                    {project.id}
                  </span>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-0.5 line-clamp-1">
                    {project.name}
                  </h3>
                  <span className="text-xs text-zinc-500 font-medium mt-1 block">
                    Client: {project.client}
                  </span>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </div>

            {/* Details Body */}
            <div className="p-6 pt-4 pb-4 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                    {project.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate">
                    {project.startDate}
                  </span>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Site Progress</span>
                  <span className="text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer / Budget & Stats */}
            <div className="bg-zinc-50/50 dark:bg-zinc-900/20 px-6 py-4 border-t border-zinc-100/60 dark:border-zinc-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Project Budget
                </span>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  <NPRAmount amount={project.budget} />
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Allocated Stock
                </span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {project.materialsTracked} items
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
