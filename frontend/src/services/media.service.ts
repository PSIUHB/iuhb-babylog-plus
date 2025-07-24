import api from './api';
/**
 * Service for handling media uploads and management
 */
class MediaService {
  /**
   * Upload a file to the server
   * @param file The file to upload
   * @param type The type of upload (avatars, documents, events)
   * @returns Promise with the upload result
   */
  async uploadFile(file: File, type: 'avatars' | 'documents' | 'events' = 'avatars') {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    // Use fetch directly for multipart/form-data
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    try {
      const response = await fetch(`${apiUrl}/media/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      return response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  /**
   * Delete a file from the server
   * @param filename The filename to delete
   * @param type The type of file (avatars, documents, events)
   * @returns Promise with the deletion result
   */
  async deleteFile(filename: string, type: 'avatars' | 'documents' | 'events' = 'avatars') {
    return api.delete(`/media/${type}/${filename}`);
  }
  /**
   * Get the full URL for an avatar
   * @param avatarUrl The avatar URL or path
   * @returns The full URL to the avatar
   */
  getAvatarUrl(avatarUrl: string | null | undefined): string {
    if (!avatarUrl) {
      return ''; // Return empty string for null/undefined
    }
    // If it's already a full URL or a data URL, return as is
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    // If it's a UI Avatars URL, return as is
    if (avatarUrl.includes('ui-avatars.com')) {
      return avatarUrl;
    }
    // Get the API URL and extract the base URL (protocol, hostname, port)
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
    let baseUrl = '';
    // If apiUrl is a full URL (starts with http), extract the origin
    if (apiUrl.startsWith('http')) {
      try {
        const url = new URL(apiUrl);
        baseUrl = url.origin; // This gives us protocol + hostname + port
      } catch (e) {
        console.error('Failed to parse API URL:', e);
      }
    } else {
      // If apiUrl is relative, use the current origin
      baseUrl = window.location.origin;
    }
    // If it's a path to a static file in the uploads directory, prepend the base URL
    if (avatarUrl.startsWith('/uploads/')) {
      // For uploads, we need to use the backend server's origin
      // If VITE_API_URL is set and contains an origin, use that
      // Otherwise, default to the backend server on port 3000
      if (!baseUrl || baseUrl === window.location.origin) {
        // If we're in development with Vite on port 5173 and backend on 3000
        if (window.location.port === '5173') {
          baseUrl = window.location.protocol + '//' + window.location.hostname + ':3000';
        }
      }
      return `${baseUrl}${avatarUrl}`;
    }
    // If the path already starts with the API URL, return it as is
    if (avatarUrl.startsWith(apiUrl)) {
      return avatarUrl;
    }
    // Otherwise, prepend the API URL
    // Remove leading slash if present to avoid double slashes
    const cleanPath = avatarUrl.startsWith('/') ? avatarUrl.substring(1) : avatarUrl;
    return `${apiUrl}/${cleanPath}`;
  }
  /**
   * Generate an avatar with initials as an SVG data URL
   * @param name The name to use for initials
   * @param background Background color (hex without #)
   * @param color Text color (hex without #)
   * @returns Data URL containing SVG image
   */
  getInitialsAvatar(name: string, background: string = '6366f1', color: string = 'ffffff'): string {
    // Extract initials from name
    const initials = this.getInitialsFromName(name);
    // Convert hex colors to include # prefix
    const bgColor = `#${background}`;
    const textColor = `#${color}`;
    // Create SVG for the avatar
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${bgColor}" />
        <text 
          x="50" 
          y="50" 
          font-family="Arial, sans-serif" 
          font-size="40" 
          font-weight="bold" 
          fill="${textColor}" 
          text-anchor="middle" 
          dominant-baseline="central"
        >
          ${initials}
        </text>
      </svg>
    `;
    // Convert SVG to a data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  /**
   * Extract initials from a name
   * @param name Full name
   * @returns Initials (1-2 characters)
   */
  private getInitialsFromName(name: string): string {
    if (!name || name.trim() === '') {
      return '?';
    }
    // Split the name by spaces and get the first letter of each part
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      // If only one name part, return the first letter
      return parts[0].charAt(0).toUpperCase();
    } else {
      // If multiple name parts, return first letter of first and last parts
      const firstInitial = parts[0].charAt(0).toUpperCase();
      const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }
  }
}
export default new MediaService();