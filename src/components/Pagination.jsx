import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showInfo = true 
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at edges
      if (currentPage <= 2) {
        end = Math.min(maxVisiblePages - 1, totalPages - 1);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxVisiblePages + 1);
      }
      
      // Add dots if there's a gap
      if (start > 2) {
        pages.push('dots');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add dots if there's a gap
      if (end < totalPages - 1) {
        pages.push('dots');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      {/* Previous Button */}
      <button
        className="pagination-btn arrow"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        page === 'dots' ? (
          <span key={`dots-${index}`} className="pagination-dots">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}

      {/* Next Button */}
      <button
        className="pagination-btn arrow"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next →
      </button>

      {/* Page Info */}
      {showInfo && (
        <div className="pagination-info">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};

export default Pagination;

