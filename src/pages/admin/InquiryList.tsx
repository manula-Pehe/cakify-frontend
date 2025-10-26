import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  CheckCircle2,
  Mail,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import { inquiryService } from '@/services/inquiryService';
import { inquiryCategoryService } from '../../services/inquiryCategoryService';
import { InquiryResponse, InquiryCategoryResponse, PaginatedResponse, InquiryStatus, InquiryStats } from '@/types/inquiry';
import { formatDate, formatRelativeTime, getStatusColor, getStatusLabel, truncateText } from '@/lib/formatters';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@/lib/constants';

import InquiryDetailModal from '@/components/admin/InquiryDetailModal';

export default function InquiryList() {
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [categories, setCategories] = useState<InquiryCategoryResponse[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Delete confirmation
  const [inquiryToDelete, setInquiryToDelete] = useState<InquiryResponse | null>(null);

  const { toast } = useToast();

  // Fetch inquiries when filters/pagination change
  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [currentPage, pageSize, statusFilter, searchTerm]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      if (searchTerm) {
        const data = await inquiryService.searchInquiries(searchTerm);
        setInquiries(data);
        setTotalElements(data.length);
        setTotalPages(1);
      } else {
        const data = await inquiryService.getInquiriesPaginated(currentPage, pageSize, statusFilter || undefined);
        setInquiries(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
      toast({ title: 'Error', description: 'Failed to load inquiries. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await inquiryCategoryService.getActiveCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await inquiryService.getDashboardStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchInquiries(), fetchStats()]);
    setRefreshing(false);
    toast({ title: 'Refreshed', description: 'Inquiry list has been updated.' });
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
    setSearchInput('');
    setCurrentPage(0);
  };

  const handleViewDetails = (inquiry: InquiryResponse) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (inquiry: InquiryResponse) => {
    setInquiryToDelete(inquiry);
  };

  const handleDeleteConfirm = async () => {
    if (!inquiryToDelete) return;
    try {
      await inquiryService.deleteInquiry(inquiryToDelete.id);
      toast({ title: 'Deleted', description: `Inquiry #${inquiryToDelete.id} has been deleted.` });
      fetchInquiries();
      setInquiryToDelete(null);
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      toast({ title: 'Error', description: 'Failed to delete inquiry.', variant: 'destructive' });
    }
  };

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(0);
  };

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and respond to customer inquiries</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Inquiries</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stats.totalInquiries}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.newInquiries}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolvedInquiries}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reopened</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.reopenedInquiries}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="REOPENED">Reopened</SelectItem>
              </SelectContent>
            </Select>

            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, email, or message..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Inquiries</CardTitle>
              <CardDescription>
                Showing {startItem}-{endItem} of {totalElements} inquiries
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No inquiries found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search criteria</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inquiries.map((inquiry) => (
                    <TableRow key={inquiry.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">#{inquiry.id}</TableCell>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{inquiry.email}</TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm" title={inquiry.subject || inquiry.message}>
                          {truncateText(inquiry.subject || inquiry.message, 40)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {inquiry.categoryName ? (
                          <Badge variant="secondary" className="text-xs">{inquiry.categoryName}</Badge>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(inquiry.status)}>
                          {getStatusLabel(inquiry.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div title={formatDate(inquiry.createdAt)}>{formatRelativeTime(inquiry.createdAt)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(inquiry)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inquiry.status === InquiryStatus.NEW && (
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(inquiry)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(inquiry)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Page {currentPage + 1} of {totalPages}</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(0)} disabled={currentPage === 0}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showDetailModal && selectedInquiry && (
        <InquiryDetailModal inquiry={selectedInquiry} open={showDetailModal} onOpenChange={setShowDetailModal} onUpdate={fetchInquiries} />
      )}

      <AlertDialog open={!!inquiryToDelete} onOpenChange={() => setInquiryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete inquiry #{inquiryToDelete?.id} from {inquiryToDelete?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
