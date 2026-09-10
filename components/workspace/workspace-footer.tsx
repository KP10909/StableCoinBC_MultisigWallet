"use client";

import { ShieldCheck, ArrowUpRight } from "lucide-react";

import { explorer } from "../../lib/workspace";

export function WorkspaceFooter() {
  return (
    <footer>
      <span>
        <ShieldCheck size={14} /> 서명 키는 하드웨어 기기에 보관됩니다.
      </span>
      <a href={explorer} target="_blank" rel="noreferrer">
        KCP Explorer <ArrowUpRight size={13} />
      </a>
    </footer>
  );
}
