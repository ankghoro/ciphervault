export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  _count?: { credentials: number };
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  children?: Group[];
  _count?: { credentials: number };
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Credential {
  id: string;
  title: string;
  username?: string | null;
  passwordMasked?: string;
  url?: string | null;
  notes?: string | null;
  categoryId?: string | null;
  groupId?: string | null;
  category?: { id: string; name: string; color: string } | null;
  group?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface Metrics {
  activeCredentials: number;
  trashCount: number;
  groupsCount: number;
  categoriesCount: number;
  encryptionAlgorithm: string;
}
