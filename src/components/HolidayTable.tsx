import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Edit, Trash2, Plus } from "lucide-react";
import { Holiday } from "@/types/task";

interface HolidayTableProps {
    holidays: Holiday[];
    onCreateHoliday: () => void;
    onEditHoliday: (holiday: Holiday) => void;
    onDeleteHoliday: (holiday: Holiday) => void;
}

type SortField = "name" | "date";
type SortDirection = "asc" | "desc";

export function HolidayTable({ holidays, onCreateHoliday, onEditHoliday, onDeleteHoliday }: HolidayTableProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter + Sort
    const filteredAndSortedHolidays = useMemo(() => {
        let filtered = holidays.filter((h) =>
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.startDate.toLocaleDateString().toLowerCase().includes(search.toLowerCase()) ||
            h.endDate.toLocaleDateString().toLowerCase().includes(search.toLowerCase())
        );

        filtered.sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortField) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "date":
                    aValue = a.startDate.getTime();
                    bValue = b.startDate.getTime();
                    break;
            }
            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [holidays, search, sortField, sortDirection]);

    // Pagination
    const paginatedHolidays = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedHolidays.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedHolidays, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedHolidays.length / itemsPerPage);

    // Sorting button
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gazetted Holidays</h2>
                <Button onClick={onCreateHoliday} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Holiday
                </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search holidays..."
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
                            <TableHead><SortButton field="name">Holiday Name</SortButton></TableHead>
                            <TableHead><SortButton field="date">Date</SortButton></TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedHolidays.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    No holidays found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedHolidays.map((holiday) => (
                                <TableRow key={holiday.id} className="hover:bg-muted/50">
                                    <TableCell>{holiday.name}</TableCell>
                                    {/* <TableCell>{holiday.date.toLocaleDateString()}</TableCell> */}
                                    <TableCell>
                                        {holiday.startDate.toDateString() === holiday.endDate.toDateString()
                                            ? holiday.startDate.toLocaleDateString()
                                            : `${holiday.startDate.toLocaleDateString()} - ${holiday.endDate.toLocaleDateString()}`}
                                    </TableCell>

                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEditHoliday(holiday)}
                                        >
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteHoliday(holiday)}
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
                        {Math.min(currentPage * itemsPerPage, filteredAndSortedHolidays.length)} of{" "}
                        {filteredAndSortedHolidays.length} holidays
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
