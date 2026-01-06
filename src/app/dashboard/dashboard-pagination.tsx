"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";
import { memo } from "react";

interface DataTablePaginationProps {
  totalPages: number;
  paginationKey?: string;
  onPageChange?: (page: number) => void;
}

function DataTablePagination({
  totalPages,
  paginationKey,
  onPageChange,
}: DataTablePaginationProps) {
  const searchParams = useSearchParams();

  const currentPage = parseInt(
    searchParams.get(paginationKey || "page") || "1"
  );

  const setPage = (page: number) => {
    // Only notify parent component - let it handle URL updates to avoid loops
    onPageChange?.(page);
  };

  const createPageLinks = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 4) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            className={
              currentPage === 1
                ? "cursor-not-allowed pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) setPage(currentPage - 1);
            }}
          />
        </PaginationItem>

        {createPageLinks().map((item, idx) => (
          <PaginationItem key={idx}>
            {item === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  setPage(item);
                }}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            className={
              currentPage === totalPages
                ? "cursor-not-allowed pointer-events-none opacity-50"
                : "cursor-pointer"
            }
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) setPage(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default memo(DataTablePagination);
