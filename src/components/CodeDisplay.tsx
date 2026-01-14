'use client';

import type { FileNode } from '@/lib/project-template';

interface CodeDisplayProps {
  file: FileNode;
}

export function CodeDisplay({ file }: CodeDisplayProps) {
  return (
    <div className="p-4 h-full">
      <pre className="text-sm leading-relaxed whitespace-pre-wrap break-all h-full">
        <code>{file.content}</code>
      </pre>
    </div>
  );
}
