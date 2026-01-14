'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getProjectTemplate, type FolderNode, type FileNode } from '@/lib/project-template';
import { FileTree } from './FileTree';
import { CodeDisplay } from './CodeDisplay';
import { Workflow, Cpu, FolderGit2, Code2, Loader2, Wand2 } from 'lucide-react';
import { Separator } from './ui/separator';

const formSchema = z.object({
  projectName: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Project name can only contain letters, numbers, underscores, and hyphens.',
  }),
});

export function FleaxovaManager() {
  const [projectStructure, setProjectStructure] = useState<FolderNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: 'fleaxova-app',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    setProjectStructure(null);
    setSelectedFile(null);
    setTimeout(() => {
      setProjectStructure(getProjectTemplate(values.projectName));
      setIsGenerating(false);
    }, 1500);
  }

  const handleSelectFile = (file: FileNode) => {
    setSelectedFile(file);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Workflow className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Fleaxova Manager</h1>
          <p className="text-muted-foreground">Instantly scaffold your Fleaxova projects with a single click.</p>
        </div>
      </header>

      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Enter a name for your new project to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-auto sm:flex-grow">
                    <FormLabel className="sr-only">Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., my-awesome-project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
                <span>{isGenerating ? 'Generating...' : 'Create Project'}</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Project Structure</CardTitle>
          <CardDescription>
            Your generated project structure will appear below. Click on a file to view its contents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[400px] border rounded-lg p-4">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="flex items-center gap-2 text-sm font-semibold mb-4 px-2">
                <FolderGit2 className="text-primary" />
                <span>File Explorer</span>
              </div>
              <Separator className="mb-4" />
              <div className="h-96 overflow-auto pr-2">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Cpu className="h-12 w-12 mb-4 animate-pulse" />
                    <p>Generating project files...</p>
                  </div>
                )}
                {!isGenerating && projectStructure ? (
                  <FileTree root={projectStructure} onSelectFile={handleSelectFile} selectedFile={selectedFile} />
                ) : !isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Cpu className="h-12 w-12 mb-4" />
                    <p>Your project will appear here.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-8 lg:col-span-9">
               <div className="flex items-center gap-2 text-sm font-semibold mb-4 px-2">
                <Code2 className="text-primary" />
                <span>Code Viewer</span>
              </div>
               <Separator className="mb-4" />
              <div className="h-96 overflow-auto rounded-md bg-secondary/50">
                 {selectedFile ? (
                  <CodeDisplay file={selectedFile} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Code2 className="h-12 w-12 mb-4" />
                    <p>Select a file to see its content.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
