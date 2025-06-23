"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"

const sampleData = [
  {
    id: 1,
    product: "MacBook Pro",
    category: "Laptops",
    price: 2499,
    quantity: 15,
    region: "North",
    date: "2024-01-15",
  },
  { id: 2, product: "iPhone 15", category: "Phones", price: 999, quantity: 32, region: "South", date: "2024-01-14" },
  { id: 3, product: "iPad Air", category: "Tablets", price: 599, quantity: 28, region: "East", date: "2024-01-13" },
  {
    id: 4,
    product: "AirPods Pro",
    category: "Accessories",
    price: 249,
    quantity: 45,
    region: "West",
    date: "2024-01-12",
  },
  {
    id: 5,
    product: "Surface Laptop",
    category: "Laptops",
    price: 1299,
    quantity: 18,
    region: "North",
    date: "2024-01-11",
  },
  { id: 6, product: "Galaxy S24", category: "Phones", price: 899, quantity: 25, region: "South", date: "2024-01-10" },
  { id: 7, product: "Surface Pro", category: "Tablets", price: 1099, quantity: 12, region: "East", date: "2024-01-09" },
  {
    id: 8,
    product: "Magic Mouse",
    category: "Accessories",
    price: 79,
    quantity: 67,
    region: "West",
    date: "2024-01-08",
  },
]

interface DataTableProps {
  fileName: string
  realTimeMode?: boolean
}

export function DataTable({ fileName, realTimeMode = false }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const itemsPerPage = 5

  const filteredData = sampleData.filter(
    (item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Raw Data View
          {realTimeMode && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Live Updates</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Showing data from {fileName} • {filteredData.length} records
          {realTimeMode && <span className="text-green-600 ml-2">• Live monitoring active</span>}
        </CardDescription>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products, categories, regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category}</Badge>
                  </TableCell>
                  <TableCell>${item.price.toLocaleString()}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.region}</TableCell>
                  <TableCell>{item.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
