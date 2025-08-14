import { Folder, File, MoreVertical, Upload, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { files } from '@/lib/data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function FileManager() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>File Manager</CardTitle>
        <div className="flex gap-2">
            <Button variant="outline"><Upload className="mr-2 h-4 w-4"/> Upload Files</Button>
            <Button><FolderPlus className="mr-2 h-4 w-4"/> New Folder</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Last Modified</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {file.type === 'folder' ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                    <span>{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{file.lastModified}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{file.size}</TableCell>
                <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
