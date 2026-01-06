"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Loader2, Building2, Eye, AlertCircle, Calendar } from "lucide-react" 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query" 
import { getApprovedFeatured, getPendingFeatured } from "@/app/actions/property/featured-properties" 
import { FeaturedProperty, PaginatedResponse } from "@/types/website/property/property-types" 
import { toast } from "sonner"
import { useMemo, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Skeleton } from "../ui/skeleton"
import { deleteFeatured, updateFeaturedStatus } from "@/app/actions/featured-property"
import Image from "next/image"

interface FeaturedPropertiesTableProps {
  type: "pending" | "approved"
}

type FeaturedPropertiesResponse = PaginatedResponse<FeaturedProperty> & {
  total_pages?: number
  current_page?: number
}

export function FeaturedPropertiesTable({ type }: FeaturedPropertiesTableProps) { 
  const queryClient = useQueryClient()

  // Local pagination state
  const [page, setPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)

  const { data, isLoading, isError, error, isFetching } = useQuery<FeaturedPropertiesResponse>({
    queryKey: ["featured-properties", type, page, pageSize],
    queryFn: () => (type === "pending" ? getPendingFeatured(page, pageSize) : getApprovedFeatured(page, pageSize)), 
    refetchOnWindowFocus: false,
}) 

  const properties = data?.results || []
  const count = data?.count || 0
  const totalPages = useMemo(() => {
    // Prefer API-provided total_pages if available; otherwise derive from count
    const apiTotal = data?.total_pages
    return typeof apiTotal === "number" && apiTotal > 0 ? apiTotal : Math.max(1, Math.ceil(count / pageSize))
  }, [data, count, pageSize])

  const currentPage = useMemo(() => {
    const apiPage = data?.current_page
    return typeof apiPage === "number" && apiPage > 0 ? apiPage : page
  }, [data, page])

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, count)

  // Mutation for updating status
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateFeaturedStatus(id, status),
    onSuccess: () => {
      // Invalidate and refetch both queries
      queryClient.invalidateQueries({ queryKey: ["featured-properties"] })
      toast.success("Property status updated successfully.")
    },
    onError: () => {
      toast.error("Failed to update property status. Please try again.")
    },
  })
  
  // this is delete function
  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-properties"] })
      toast.success("Property deleted successfully.")
      // Close dialog and reset state only on success
      setDeleteDialogOpen(false)
      setDeleteSelectedId(null)
      setDeleteTargetInfo(null)
      setDeleteConfirmText("")
    },
    onError: () => {
      toast.error("Failed to delete property. Please try again.")
      // Keep dialog open on error so user can retry
    },
  })

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteSelectedId, setDeleteSelectedId] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleteTargetInfo, setDeleteTargetInfo] = useState<{title: string, seller: string} | null>(null);

  // Handlers for dialog
  const openDeleteDialog = (id: string, property?: FeaturedProperty) => {
    setDeleteSelectedId(id)
    setDeleteConfirmText("")
    setDeleteTargetInfo(property ? {title: property?.property?.title ?? "Untitled", seller: property?.profile?.name ?? ""} : null)
    setDeleteDialogOpen(true)
  }
  const handleDeleteConfirmed = () => {
    if (deleteSelectedId) {
      deleteMutation.mutate({
        id: deleteSelectedId,
      })
      // Remove the immediate dialog closing - it will close on success
    }
  }
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false)
    setDeleteSelectedId(null)
    setDeleteTargetInfo(null)
    setDeleteConfirmText("")
  }

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Skeleton loading state
  if (isLoading && !data) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/30">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-36 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-24 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-20 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-32 rounded" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <Skeleton className="h-5 w-24 rounded" />
                  </th>
                  <th className="px-4 py-3 text-center">
                    <Skeleton className="h-5 w-16 rounded" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-36 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-5 w-24 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-5 w-20 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-5 w-32 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-5 w-24 rounded" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Skeleton className="h-6 w-10 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium text-foreground">Failed to load properties</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error)?.message || "An error occurred"}</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["featured-properties", type] })}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!isFetching && properties.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">
            {type === "pending" ? "No pending properties" : "No approved properties"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {type === "pending"
              ? "All featured property requests have been reviewed"
              : "No properties are currently featured"}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Helper to change page safely
  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
  }

  // Render numeric pagination items with ellipses for large page counts
  const renderPageItems = () => {
    const items: React.ReactNode[] = []

    const addItem = (p: number) => {
      items.push(
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            isActive={p === currentPage}
            onClick={(e) => {
              e.preventDefault()
              if (p !== currentPage) goToPage(p)
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) addItem(p)
    } else {
      const first = 1
      const last = totalPages
      const before = Math.max(currentPage - 1, 2)
      const after = Math.min(currentPage + 1, totalPages - 1)

      addItem(first)

      if (before > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      for (let p = before; p <= after; p++) addItem(p)

      if (after < totalPages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }

      addItem(last)
    }

    return items
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-2xl">
          {type === "pending" ? "Pending Featured Properties" : "Approved Featured Properties"}
        </CardTitle>
        <CardDescription>
          {type === "pending"
            ? "Review and approve properties for featured listing"
            : "Manage currently featured properties"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                <TableHead className="font-semibold text-foreground">Seller</TableHead>
                <TableHead className="font-semibold text-foreground">Property</TableHead>
                <TableHead className="font-semibold text-foreground">Pakage</TableHead>
                <TableHead className="font-semibold text-foreground">Start Date</TableHead>
                <TableHead className="font-semibold text-foreground">End Date</TableHead> 
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: FeaturedProperty) => {
                const isUpdatingCurrentProperty =
                  updateMutation.isPending &&
                  updateMutation.variables?.id === property.id
                const isDeletingCurrentProperty =
                  deleteMutation.isPending &&
                  deleteMutation.variables?.id === property.id

                return (
                  <TableRow key={property.id} className="hover:bg-muted/10 border-b border-border/30">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                        {property.profile.image ? (
                          <Image
                            src={property.profile.image ?? "/placeholder.svg"}
                            alt={property?.property?.title ?? "Property image"}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight text-balance">{property?.profile?.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-medium">
                      {property?.property?.title}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="text-balance">{property?.days}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {property.start_date
                        ? formatDate(property?.start_date)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {property.end_date
                        ? formatDate(property?.end_date)
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {type === "pending" ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                      >
                        Pending
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
                      >
                        Approved
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 bg-muted/60 font-medium"
                          >
                            <span className="sr-only">Actions</span>
                            <span className="inline-block text-lg" aria-hidden="true">⋯</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => window.open(`/properties/${property.property.slug}`)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            View
                          </DropdownMenuItem>
                          {type === "pending" ? (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(property.id, "approved")}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 cursor-pointer text-emerald-700 dark:text-emerald-400"
                              >
                                {isUpdatingCurrentProperty ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1.5" />
                                )}
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusUpdate(property.id, "rejected")}
                                disabled={updateMutation.isPending}
                                className="flex items-center gap-2 cursor-pointer text-red-700 dark:text-red-400"
                              >
                                {isUpdatingCurrentProperty ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                ) : (
                                  <X className="h-4 w-4 mr-1.5" />
                                )}
                                Reject
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(property.id, property)}
                              disabled={deleteMutation.isPending}
                              className="flex items-center gap-2 cursor-pointer text-red-700 dark:text-red-400"
                            >
                              {isDeletingCurrentProperty ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                              ) : (
                                <X className="h-4 w-4 mr-1.5" />
                              )}
                              Remove
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) handleDeleteDialogClose(); }}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <DialogDescription>
                Are you sure you want to <span className="font-semibold">remove</span> this featured property?
              </DialogDescription>
              {deleteTargetInfo && (
                <div className="text-sm text-foreground/80 rounded-lg p-2 bg-muted border">
                  <div className="mb-1"><strong>Title:</strong> {deleteTargetInfo?.title}</div>
                  <div><strong>Seller:</strong> {deleteTargetInfo.seller}</div>
                </div>
              )}
              <DialogDescription>
                To confirm, please type <span className="font-semibold">REMOVE</span> below:
              </DialogDescription>
              <Input
                autoFocus
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="Type REMOVE to confirm"
                spellCheck={false}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDeleteDialogClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={
                  deleteConfirmText !== "REMOVE" ||
                  deleteMutation.isPending
                }
                type="button"
                onClick={handleDeleteConfirmed}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Remove property</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col gap-2 border-t border-border/30 p-4">
          <div className="text-sm text-muted-foreground">
            {count > 0 ? (
              <>Showing {startIndex}-{endIndex} of {count} properties</>
            ) : (
              <>No results</>
            )}
            {isFetching && <span className="ml-2 text-xs">(updating...)</span>}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) goToPage(currentPage - 1)
                    }}
                  />
                </PaginationItem>

                {renderPageItems()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) goToPage(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  )
}