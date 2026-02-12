
import { useState, useEffect } from 'react';
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
  fetchRatingStats,
  isAuthenticated,
  getUser
} from '../services/api';
import './Comments.css';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'medium' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`star-rating star-rating--${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : 'empty'} ${!readOnly ? 'interactive' : ''}`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          role={!readOnly ? 'button' : undefined}
          aria-label={!readOnly ? `Rate ${star} stars` : undefined}
          tabIndex={!readOnly ? 0 : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Comments = ({ productId }) => {
  const pid = productId;
  const [comments, setComments] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Form state
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  
  const loggedIn = isAuthenticated();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';

  // Fetch comments and rating stats
  const loadComments = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchComments(pid, page);
      setComments(data.comments);
      setRatingStats(data.ratingStats);
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total
      });
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pid) {
      loadComments();
    }
  }, [pid]);

  // Handle add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newComment.trim()) {
      setFormError('Please enter a comment');
      return;
    }

    if (newRating < 1 || newRating > 5) {
      setFormError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      await addComment(pid, { rating: newRating, comment: newComment });
      setNewComment('');
      setNewRating(5);
      loadComments();
    } catch (err) {
      setFormError(err.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit comment
  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditComment(comment.comment);
    setEditRating(comment.rating);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditComment('');
    setEditRating(5);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editComment.trim()) {
      setFormError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await updateComment(commentId, { rating: editRating, comment: editComment });
      cancelEdit();
      loadComments();
    } catch (err) {
      setFormError(err.message || 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      loadComments();
    } catch (err) {
      alert(err.message || 'Failed to delete comment');
    }
  };

  // Check if user owns comment
  const isCommentOwner = (userId) => {
    return currentUser && currentUser.id === userId;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && comments.length === 0) {
    return (
      <div className="comments-container">
        <div className="comments-loading">
          <div className="spinner"></div>
          <p>Loading comments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comments-container">
        <div className="comments-error">
          <p>⚠️ {error}</p>
          <button onClick={() => loadComments()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-container">
      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-overview">
          <div className="rating-big">
            <span className="rating-number">{ratingStats.averageRating.toFixed(1)}</span>
            <div className="rating-stars">
              <StarRating rating={Math.round(ratingStats.averageRating)} readOnly size="large" />
            </div>
            <span className="rating-count">({ratingStats.totalReviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Add Comment Form */}
      {loggedIn ? (
        <div className="comment-form-section">
          <h3>Write a Review</h3>
          <form onSubmit={handleAddComment} className="comment-form">
            {formError && <div className="form-error">{formError}</div>}
            
            <div className="form-group">
              <label>Your Rating:</label>
              <StarRating
                rating={newRating}
                onRatingChange={setNewRating}
                size="large"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Your Review:</label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={2000}
              />
              <span className="char-count">{newComment.length}/2000</span>
            </div>
            
            <button
              type="submit"
              className="submit-comment-btn"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p>📝 Please <a href="/login">login</a> to write a review.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list-section">
        <h3>Customer Reviews ({pagination.total})</h3>
        
        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <>
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  {editingId === comment._id ? (
                    // Edit mode
                    <div className="comment-edit-form">
                      {formError && <div className="form-error">{formError}</div>}
                      
                      <div className="form-group">
                        <label>Edit Rating:</label>
                        <StarRating
                          rating={editRating}
                          onRatingChange={setEditRating}
                          size="medium"
                        />
                      </div>
                      
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                      />
                      
                      <div className="edit-actions">
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                          className="save-edit-btn"
                          disabled={submitting || !editComment.trim()}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="cancel-edit-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="comment-header">
                        <div className="comment-user-info">
                          <div className="user-avatar">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{comment.userName}</span>
                            <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                        <div className="comment-rating">
                          <StarRating rating={comment.rating} readOnly />
                        </div>
                      </div>
                      
                      <div className="comment-body">
                        <p>{comment.comment}</p>
                      </div>
                      
                      {/* Actions for owner or admin */}
                      {(isCommentOwner(comment.user) || isAdmin) && (
                        <div className="comment-actions">
                          {isCommentOwner(comment.user) && (
                            <button
                              onClick={() => startEdit(comment)}
                              className="edit-comment-btn"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="delete-comment-btn"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="comments-pagination">
                <button
                  onClick={() => loadComments(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => loadComments(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comments;