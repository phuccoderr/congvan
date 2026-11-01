import { useEffect, useMemo, useRef, useState } from 'react'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'

export interface SearchableInputOption {
  label: string
  value: number | string
}

interface SearchableInputGroupProps {
  id: string
  options: SearchableInputOption[]
  value: number | string | null
  onValueChange: (value: number | string | null) => void
  placeholder?: string
  loading?: boolean
  error?: boolean
}

export function SearchableInputGroup({
  id,
  options,
  value,
  onValueChange,
  placeholder = 'Tìm kiếm...',
  loading = false,
  error = false
}: SearchableInputGroupProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const skipSync = useRef(false)

  const selectedOption = options.find((option) => String(option.value) === String(value))

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false
      return
    }
    setSearch(selectedOption?.label ?? '')
  }, [selectedOption?.label, value])

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    if (!normalizedSearch || search === selectedOption?.label) return options
    return options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedSearch))
  }, [options, search, selectedOption?.label])

  return (
    <div className="relative w-full">
      <InputGroup>
        <InputGroupInput
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-options`}
          autoComplete="off"
          value={search}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value)
            setIsOpen(true)
            if (value !== null) {
              skipSync.current = true
              onValueChange(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setIsOpen(false)
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsOpen(false)
              setSearch(selectedOption?.label ?? '')
            }, 100)
          }}
        />
      </InputGroup>
      {isOpen && (
        <div
          id={`${id}-options`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 min-w-25 w-full flex flex-col overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {loading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Đang tải danh sách...</div>
          ) : error ? (
            <div className="px-2 py-1.5 text-sm text-destructive">
              Không thể tải danh sách. Vui lòng thử lại.
            </div>
          ) : (
            <>
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                className="w-full rounded-sm px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onValueChange(null)
                  setSearch('')
                  setIsOpen(false)
                }}
              >
                Không chọn
              </button>
              {filteredOptions.map((option) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={String(option.value) === String(value)}
                  key={option.value}
                  className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onValueChange(option.value)
                    setSearch(option.label)
                    setIsOpen(false)
                  }}
                >
                  {option.label}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Không tìm thấy kết quả.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
