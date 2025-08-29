import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Product, Project } from "@/types/task";

interface ProjectTableProps {
  projects: Project[];
  products: Product[]; // <-- added products
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
}

type SortField = "name" | "description" | "product" | "start_date" | "end_date";
type SortDirection = "asc" | "desc";

export function ProjectTable({ projects, products, onEditProject, onDeleteProject }: ProjectTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper: get product name from id
  const getProductName = (id: string) => {
    const product = products.find((p) => p.id === id);
    return product ? product.name : "—";
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const productName = getProductName(project.productId);
      return (
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase()) ||
        productName.toLowerCase().includes(search.toLowerCase())
      );
    });

    filtered.sort((a, b) => {
      let aValue: any;
        let bValue: any;
      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "description":
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case "product":
          aValue = getProductName(a.productId).toLowerCase();
          bValue = getProductName(b.productId).toLowerCase();
          break;
        case "start_date":
          aValue = a.startDate.getTime();
          bValue = b.startDate.getTime();
          break;
        case "end_date":
          aValue = a.endDate.getTime();
          bValue = b.endDate.getTime();
          break;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, products, search, sortField, sortDirection]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProjects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortButton field="name">Project Name</SortButton></TableHead>
              <TableHead><SortButton field="description">Description</SortButton></TableHead>
              <TableHead><SortButton field="product">Product</SortButton></TableHead>
              <TableHead><SortButton field="start_date">Start Date</SortButton></TableHead>
              <TableHead><SortButton field="end_date">End Date</SortButton></TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/50">
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{getProductName(project.productId)}</TableCell>
                  <TableCell>{project.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{project.endDate.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditProject(project)}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProject(project)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedProjects.length)} of{" "}
            {filteredAndSortedProjects.length} projects
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
