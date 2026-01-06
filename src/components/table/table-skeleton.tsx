import React from "react";
import { Skeleton } from "../ui/skeleton";
import { TableCell, TableRow } from "../ui/table";

interface TableSkeletonProps {
  colCount?: number;
  rowCount?: number;
  haveAction?: boolean;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  colCount =4 ,
  rowCount = 4,
  haveAction = false,
}) => {
  const totalCols = haveAction ? colCount + 1 : colCount;

  return (
    <>
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <TableRow key={rowIdx} className="animate-pulse">
            {Array.from({ length: totalCols }).map((_, colIdx) => (
              <TableCell key={colIdx}>
                <Skeleton className="w-full h-6 rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
    </>
  );
};

export default TableSkeleton;
