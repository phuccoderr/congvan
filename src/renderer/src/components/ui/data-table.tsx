import { Plus, SearchIcon, X } from 'lucide-react'
import { Button } from './button'
import { InputGroup, InputGroupAddon, InputGroupInput } from './input-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import {
  tableFeatures,
  type ColumnDef,
  type RowData,
  columnVisibilityFeature,
  rowSelectionFeature,
  useTable
} from '@tanstack/react-table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from './pagination'
import { Field, FieldLabel } from './field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './select'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

const features = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature
})

export type DataTableFeatures = typeof features

export interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface SearchFilterItem {
  field: string
  value: string
}
export interface SearchFieldOption {
  label: string
  value: string
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  onCreateClick?: () => void
  createButtonLabel?: string
  pagination: PaginationState
  onPaginationChange: (pagination: { page: number; limit: number }) => void

  // Props mới hỗ trợ tìm kiếm nhiều field gửi về backend
  searchFields?: SearchFieldOption[]
  filters?: SearchFilterItem[]
  onFiltersChange?: (filters: SearchFilterItem[]) => void
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onCreateClick,
  createButtonLabel = 'Tạo mới',
  pagination,
  onPaginationChange,

  searchFields = [],
  filters = [],
  onFiltersChange
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns
  })

  const [localFilters, setLocalFilters] = useState<SearchFilterItem[]>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const [debouncedFilters] = useDebounce(localFilters, 500)

  useEffect(() => {
    onFiltersChange?.(debouncedFilters)
  }, [debouncedFilters])

  const { page, limit, totalPages } = pagination

  const handleLimitChange = (value: string) => {
    onPaginationChange({
      page: 1, // Reset về trang 1 khi thay đổi số lượng item trên trang
      limit: Number(value)
    })
  }

  const handlePreviousPage = () => {
    if (page > 1) {
      onPaginationChange({
        page: page - 1,
        limit
      })
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      onPaginationChange({
        page: page + 1,
        limit
      })
    }
  }

  // Thêm một điều kiện tìm kiếm mới
  const handleAddFilter = () => {
    const defaultField = searchFields[0]?.value || ''
    const newFilters = [...localFilters, { field: defaultField, value: '' }]
    setLocalFilters(newFilters)
  }

  // Xóa một điều kiện tìm kiếm theo index
  const handleRemoveFilter = (index: number) => {
    const newFilters = localFilters.filter((_, i) => i !== index)
    setLocalFilters(newFilters)
  }

  // Thay đổi field của một điều kiện tìm kiếm
  const handleFieldChange = (index: number, field: string) => {
    const newFilters = [...localFilters]
    newFilters[index].field = field
    setLocalFilters(newFilters)
  }

  // Thay đổi giá trị (keyword) của một điều kiện tìm kiếm
  const handleValueChange = (index: number, value: string) => {
    const newFilters = [...localFilters]
    newFilters[index].value = value
    setLocalFilters(newFilters)
  }

  return (
    <div className="overflow-hidden">
      <div className="p-1 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddFilter}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Thêm tìm kiếm theo trường
            </Button>
          </div>
          <div className="flex gap-1 items-center">
            <Button onClick={onCreateClick}>{createButtonLabel}</Button>
          </div>
        </div>

        {/* Danh sách các input tìm kiếm theo từng field */}
        {localFilters.length > 0 && (
          <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
            {localFilters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2">
                {/* Dropdown chọn field */}
                <Select value={filter.field} onValueChange={(val) => handleFieldChange(index, val)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn trường..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {searchFields.map((sf) => (
                        <SelectItem key={sf.value} value={sf.value}>
                          {sf.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Input nhập giá trị tìm kiếm */}
                <div className="flex-1">
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Nhập giá trị tìm kiếm..."
                      value={filter.value}
                      onChange={(e) => handleValueChange(index, e.target.value)}
                    />
                    <InputGroupAddon align="inline-start">
                      <SearchIcon className="text-muted-foreground w-4 h-4" />
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                {/* Nút xóa điều kiện tìm kiếm */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(index)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-2">
        {/* Rows per page selector */}
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select value={String(limit)} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Pagination info and buttons */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Trang {page} / {totalPages || 1}
          </span>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePreviousPage()
                  }}
                  // Thêm style disable nếu đang ở trang đầu
                  aria-disabled={page <= 1}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNextPage()
                  }}
                  // Thêm style disable nếu đang ở trang cuối
                  aria-disabled={page >= totalPages}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
