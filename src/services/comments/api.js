import { API_BASE_URL, fetchWithTimeout, handleResponse } from '../http/client';
import { getAuthHeaders } from '../auth/storage';

export const addComment = async (pid, commentData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments`, {
      method: 'POST',
      body: JSON.stringify({ pid, ...commentData }),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to add comment: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Add comment request timed out. Please try again.');
    }
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const fetchComments = async (pid, page = 1, limit = 10) => {
  try {
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/comments/product/${pid}?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch comments request timed out. Please try again.');
    }
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update comment: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Update comment request timed out. Please try again.');
    }
    console.error('Error updating comment:', error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete comment: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Delete comment request timed out. Please try again.');
    }
    console.error('Error deleting comment:', error);
    throw error;
  }
};

export const fetchRatingStats = async (pid) => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/comments/stats/${pid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch rating stats: ${response.status}`);
    }

    return await handleResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Fetch rating stats request timed out. Please try again.');
    }
    console.error('Error fetching rating stats:', error);
    throw error;
  }
};
