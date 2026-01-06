"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { useState, useMemo, useEffect, ChangeEvent, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DataTablePagination from "@/app/dashboard/dashboard-pagination";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import PageSizeSelector from "./page-size-selector";
import ColumnsSelector from "./columns-selector";
import TableSkeleton from "./table-skeleton";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { DeleteAlert } from "../delete-alert";

interface AdvancedTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchPlaceholder: string;
  searchColumn: string;
  onDeleteSelected?: (items: T[]) => Promise<void>;
  onRowClick?: (row: T) => void;
  isClickable?: boolean;
  totalCount?: number;
  pageSize?: number;
  pageIndex?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  serverPagination?: boolean;
  serverSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  paginationKey?: string;
  pageSizeKey?: string;
  emptyStateComponent?: ReactNode;
}

export default function AdvancedTable<TData>({
  columns,
  data,
  searchPlaceholder,
  searchColumn = "",
  onDeleteSelected,
  onRowClick,
  isClickable,
  totalCount = 0,
  pageSize = 10,
  pageIndex = 0,
  onPaginationChange,
  serverPagination = false,
  serverSearch = false,
  searchValue = "",
  onSearchChange,
  isLoading = false,
  paginationKey = "page",
  pageSizeKey = "page_size",
  emptyStateComponent,
}: AdvancedTableProps<TData>) {
  const safeData = useMemo(() => data, [data]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize pagination state
  const [pagination, setPagination] = useState({
    pageIndex: pageIndex,
    pageSize: pageSize,
  });

  // Update local search value when prop changes
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Update local pagination state when props change
  useEffect(() => {
    setPagination({
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }, [pageIndex, pageSize]);

  const table = useReactTable({
    data: safeData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    // Conditionally use pagination model based on serverPagination flag
    getPaginationRowModel: serverPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: serverSearch ? undefined : getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    // For server pagination, manually control the pagination state
    manualPagination: serverPagination,
    manualFiltering: serverSearch,
    pageCount: serverPagination
      ? Math.ceil(totalCount / pagination.pageSize)
      : undefined,

    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newPagination = updater(pagination);
        setPagination(newPagination);
        onPaginationChange?.(newPagination.pageIndex, newPagination.pageSize);
      } else {
        setPagination(updater);
        onPaginationChange?.(updater.pageIndex, updater.pageSize);
      }
    },

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  const tablePaginationState = table.getState().pagination;
  const isServerDriven = serverPagination || serverSearch;
  const resolvedTotalCount = isServerDriven
    ? totalCount ?? safeData.length
    : table.getFilteredRowModel().rows.length;
  const showingFrom =
    resolvedTotalCount === 0
      ? 0
      : tablePaginationState.pageIndex * tablePaginationState.pageSize + 1;
  const showingTo =
    resolvedTotalCount === 0
      ? 0
      : Math.min(
          resolvedTotalCount,
          (tablePaginationState.pageIndex + 1) *
            tablePaginationState.pageSize
        );
  const paginationTotalPages = serverPagination || serverSearch
    ? Math.max(
        Math.ceil(
          (resolvedTotalCount || 0) /
            Math.max(tablePaginationState.pageSize, 1)
        ),
        1
      )
    : Math.max(table.getPageCount(), 1);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (serverSearch) {
          onSearchChange?.(value);
        } else {
          table.getColumn(searchColumn)?.setFilterValue(value);
        }
      }, 500),
    [serverSearch, onSearchChange, searchColumn, table]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleDeleteSelected = async () => {
    if (!onDeleteSelected) {
      setShowDeleteAlert(false);
      return;
    }

    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);

    try {
      await onDeleteSelected(selectedRows);
    } finally {
      setShowDeleteAlert(false);
    }
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    show: { opacity: 1, scale: 1 },
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchValue(value);
    debouncedSearch(value);
  };

  const onPageSizeChange = (value: string) => {
    const nextPageSize = parseInt(value, 10);
    table.setPagination({ pageIndex: 0, pageSize: nextPageSize });
    onPaginationChange?.(0, nextPageSize);

    const params = new URLSearchParams(searchParams.toString());
    params.set(pageSizeKey || "page_size", value.toString());
    params.set(paginationKey || "page", "1");

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center py-4">
        <motion.div
          className="flex gap-2 items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            placeholder={`Filter ${searchPlaceholder}...`}
            value={localSearchValue}
            onChange={handleSearchInputChange}
            className="max-w-sm"
          />
          {onDeleteSelected &&
            table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DeleteAlert
              count={table.getFilteredSelectedRowModel().rows.length}
              open={showDeleteAlert}
              onOpenChange={setShowDeleteAlert}
              onDelete={handleDeleteSelected}
              trigger={
                <Button
                  variant="destructive"
                  className="p-2 px-3 text-white rounded-xl"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete selected
                </Button>
              }
            />
          )}
        </motion.div>
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ColumnsSelector table={table} />
          <PageSizeSelector
            value={table.getState().pagination.pageSize.toString()}
            onChange={onPageSizeChange}
          />
        </motion.div>
      </div>
      <motion.div
        className="rounded-xl border border-muted-foreground/50 bg-background/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <AnimatePresence mode="wait">
            <motion.tbody
              variants={tableVariants}
              initial="hidden"
              animate="show"
            >
              {isLoading ? (
                <TableSkeleton colCount={columns.length} />
              ) : (
                  serverPagination
                    ? safeData.length > 0
                    : table.getRowModel().rows?.length > 0
                ) ? (
                table.getRowModel().rows.map((row) => (
                  <motion.tr
                    key={row.id}
                    variants={rowVariants}
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      isClickable ? "cursor-pointer hover:bg-muted/50" : ""
                    }
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        data-cell-type={
                          cell.column.id === "actions" ? "action" : "default"
                        }
                        onClick={(e) => {
                          const target = e.target as HTMLElement;

                          // Skip click if clicking interactive elements
                          if (
                            target.closest("button") ||
                            target.closest("a") ||
                            target.closest("input") ||
                            target.closest("select") ||
                            target.closest('[data-cell-type="action"]') ||
                            target.closest('dialog, [role="dialog"]')
                          ) {
                            return;
                          }

                          if (onRowClick) {
                            onRowClick(row.original);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : emptyStateComponent ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    {emptyStateComponent}
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center bg-gray-50/50 dark:bg-gray-900/20"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-gray-400 dark:text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          No results found
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </motion.tbody>
          </AnimatePresence>
        </Table>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="
    flex 
    flex-col 
    sm:flex-row 
    items-center 
    justify-between 
    gap-2
  "
      >
        
        {!isLoading && resolvedTotalCount > 0 && (
          <div className="text-center text-sm w-full sm:w-auto pt-3">
            Showing {showingFrom} to {showingTo} of {resolvedTotalCount}{" "}
            {resolvedTotalCount === 1 ? "item" : "items"}
          </div>
        )}

     
        <div className="mt-2 sm:mt-0 w-full sm:w-auto flex justify-center sm:justify-end">
          <DataTablePagination
            totalPages={paginationTotalPages}
            paginationKey={paginationKey}
            onPageChange={(page) => {
              const newPageIndex = page - 1;
              const nextPageSize = table.getState().pagination.pageSize;

              table.setPagination({
                pageIndex: newPageIndex,
                pageSize: nextPageSize,
              });
              onPaginationChange?.(newPageIndex, nextPageSize);

              const params = new URLSearchParams(searchParams.toString());
              params.set(paginationKey || "page", page.toString());
              const queryString = params.toString();
              const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
              router.replace(newUrl);
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
