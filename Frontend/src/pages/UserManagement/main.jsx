import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Chip,
  Avatar,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Refresh as RefreshIcon,
  WorkspacePremium as CrownIcon,  // Admin icon
  ShieldOutlined as ShieldIcon     // User icon
} from '@mui/icons-material';
import { Select } from 'antd';

const { Option } = Select;

const UserManagement = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getUsers();
      setUsers(response.data.users);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      setUpdatingUser(userId);
      await authService.updateUserStatus(userId, !currentStatus);
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUser(userId);
      await authService.updateUserRole(userId, newRole);
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUser(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  // Role pill base style
  const rolePillBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    borderRadius: 999,
    fontWeight: 700,
    letterSpacing: 0.2,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'transform 120ms ease, boxShadow 120ms ease',
    border: 'none',
  };

  const getPillVisuals = (role) => {
    const isAdminRole = role === 'admin';
    return {
      color: isAdminRole ? '#6b21a8' : '#1d4ed8',
      background: isAdminRole
        ? 'linear-gradient(90deg, #f5e8ff 0%, #eadcff 100%)'
        : 'linear-gradient(90deg, #e6f0ff 0%, #d6e6ff 100%)',
      boxShadow: isAdminRole
        ? '0 2px 10px rgba(107,33,168,0.18)'
        : '0 2px 10px rgba(29,78,216,0.18)',
    };
  };

  const RoleOption = ({ role, style }) => {
    const isAdminRole = role === 'admin';
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 10,
          ...style
        }}
      >
        {isAdminRole ? (
          <CrownIcon style={{ fontSize: 16, color: '#a855f7' }} />
        ) : (
          <ShieldIcon style={{ fontSize: 16, color: '#2563eb' }} />
        )}
        <span style={{ fontWeight: 700, color: isAdminRole ? '#6b21a8' : '#1d4ed8' }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </div>
    );
  };

  if (!isAdmin()) {
    return (
      <Box className="p-6">
        <Alert severity="error">
          Access denied. Admin privileges required to view this page.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-bold text-gray-900">
          User Management
        </Typography>
        <Tooltip title="Refresh users">
          <IconButton onClick={fetchUsers} className="bg-gray-100 hover:bg-gray-200">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper className="overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">User</TableCell>
                <TableCell className="font-semibold">Email</TableCell>
                <TableCell className="font-semibold">Role</TableCell>
                <TableCell className="font-semibold">Status</TableCell>
                <TableCell className="font-semibold">Joined</TableCell>
                <TableCell className="font-semibold">Last Login</TableCell>
                <TableCell className="font-semibold">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50">
                  <TableCell>
                    <Box className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} />
                      <Box>
                        <Typography variant="body2" className="font-medium">
                          {user.name}
                        </Typography>
                        {user._id === currentUser._id && (
                          <Chip
                            label="You"
                            size="small"
                            className="bg-blue-100 text-blue-800 text-xs"
                          />
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" className="text-gray-600">
                      {user.email}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Select
                      value={user.role}
                      onChange={(value) => handleRoleChange(user._id, value)}
                      disabled={user._id === currentUser._id || updatingUser === user._id}
                      bordered={false}
                      dropdownStyle={{ borderRadius: 12, padding: 8 }}
                      popupMatchSelectWidth={200}
                      suffixIcon={<span style={{ opacity: 0.7 }}>▾</span>}
                      style={{
                        ...rolePillBase,
                        ...getPillVisuals(user.role),
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                    >
                      <Option value="admin">
                        <RoleOption
                          role="admin"
                          style={{ background: 'linear-gradient(90deg,#f5e8ff,#eadcff)' }}
                        />
                      </Option>
                      <Option value="user">
                        <RoleOption
                          role="user"
                          style={{ background: 'linear-gradient(90deg,#e6f0ff,#d6e6ff)' }}
                        />
                      </Option>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Box className="flex items-center gap-2">
                      {user.isActive ? (
                        <ActiveIcon className="text-green-500" fontSize="small" />
                      ) : (
                        <InactiveIcon className="text-red-500" fontSize="small" />
                      )}
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        className={
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      />
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" className="text-gray-600">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" className="text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {user._id !== currentUser._id && (
                      <Tooltip title={user.isActive ? 'Deactivate user' : 'Activate user'}>
                        <Switch
                          checked={user.isActive}
                          onChange={() => handleStatusToggle(user._id, user.isActive)}
                          disabled={updatingUser === user._id}
                          color="primary"
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box className="mt-4 text-center">
        <Typography variant="body2" className="text-gray-500">
          Total Users: {users.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserManagement;
