import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CustomPagination({ currentPage, totalPages, onPageChange }: CustomPaginationProps) {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // Always show first page
    pageNumbers.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => onPageChange(1)}
          href="#"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Calculate range of pages to show
    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);
    
    // Adjust if we're near the start
    if (startPage > 2) {
      pageNumbers.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => onPageChange(i)}
            href="#"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            href="#"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return pageNumbers;
  };
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-1 pl-2.5",
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            )}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
        </PaginationItem>
        
        {renderPageNumbers()}
        
        <PaginationItem>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "gap-1 pr-2.5",
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            )}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}