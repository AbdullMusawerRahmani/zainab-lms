import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PageSizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const pageSizes = [5, 7, 10, 20, 50, 100];

function PageSizeSelector({ value, onChange }: PageSizeSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Show" />
      </SelectTrigger>
      <SelectContent>
        {pageSizes.map((size) => (
          <SelectItem key={size} value={size.toString()}>
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default PageSizeSelector;
