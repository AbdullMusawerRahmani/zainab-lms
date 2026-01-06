import React from 'react'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Table } from '@tanstack/react-table';

interface ColumnsSelectorProps<T> {
    table: Table<T>
}

function ColumnsSelector<T>({table}:ColumnsSelectorProps<T>) {
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        Columns <ChevronDown />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {table
        .getAllColumns()
        .filter((column) => column.getCanHide())
        .map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) =>
                column.toggleVisibility(!!value)
              }
            >
              {column.id.split("_").join(" ")}
            </DropdownMenuCheckboxItem>
          );
        })}
    </DropdownMenuContent>
  </DropdownMenu>
  )
}

export default ColumnsSelector