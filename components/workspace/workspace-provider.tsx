"use client";
import { createContext, useContext } from "react";
import { useWorkspaceController } from "../../hooks/use-workspace";
const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceController
> | null>(null);
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const workspace = useWorkspaceController();
  return (
    <WorkspaceContext.Provider value={workspace}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("WorkspaceProvider is required");
  return workspace;
}
