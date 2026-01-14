'use client';

import { useState } from 'react';
import { Folder, FileText, FolderOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { ProjectNode, FileNode, FolderNode } from '@/lib/project-template';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface FileTreeProps {
  root: FolderNode;
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

interface TreeNodeProps {
  node: ProjectNode;
  onSelectFile: (file: FileNode) => void;
  selectedFile: FileNode | null;
  level: number;
}

function TreeNode({ node, onSelectFile, selectedFile, level }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);

  if (node.type === 'folder') {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left p-1.5 rounded-md hover:bg-secondary">
            {isOpen ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium">{node.name}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 border-l border-dashed border-border ml-[7px] space-y-1">
          {node.children.length > 0 ? (
            node.children
              .sort((a, b) => {
                if (a.type === 'folder' && b.type === 'file') return -1;
                if (a.type === 'file' && b.type === 'folder') return 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => (
                <TreeNode key={child.name} node={child} onSelectFile={onSelectFile} selectedFile={selectedFile} level={level + 1} />
              ))
          ) : (
            <p className="text-xs text-muted-foreground p-1.5">empty</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'w-full justify-start h-auto p-1.5',
        selectedFile?.name === node.name && selectedFile?.content === node.content ? 'bg-secondary font-semibold' : ''
      )}
      onClick={() => onSelectFile(node)}
    >
      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="text-sm">{node.name}</span>
    </Button>
  );
}

export function FileTree({ root, onSelectFile, selectedFile }: FileTreeProps) {
  return <TreeNode node={root} onSelectFile={onSelectFile} selectedFile={selectedFile} level={0} />;
}
