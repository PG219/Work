import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton, // 1. Import IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu"; // 1. Import MenuIcon
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

// 2. Accept the 'onToggleSidebar' prop from Layout.js
const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    // navigate('/profile');
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    // navigate('/settings');
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={1}
        color="inherit"
        className="!bg-white !border-b !border-gray-200"
      >
        <Toolbar className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            {/* 3. Add the Hamburger Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={onToggleSidebar}
              edge="start"
              className="!text-gray-700 md:!hidden !mr-2" // Only shows on mobile
            >
              <MenuIcon />
            </IconButton>

            {/* Brand/Logo */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/")}
            >
              <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                AI-GOVERNANCE
              </h1>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 opacity-70"></div>
            </div>
          </div>

          {/* 4. Actions (Conditionally Rendered) */}
          <Box className="flex items-center gap-3">
            {user ? (
              // --- USER IS LOGGED IN ---
              <>
                <Button
                  onClick={() => navigate("/questionare")}
                  variant="contained"
                  startIcon={<AddIcon />}
                  className="!bg-[#1d4ed8] !text-white !font-semibold !shadow-none hover:!bg-[#2563eb] transition-all duration-200"
                  sx={{
                    textTransform: "none",
                    px: 2.5,
                  }}
                >
                  Create Assessment
                </Button>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2 hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isAdmin()
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    onClick={handleMenuOpen}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    className="mt-2"
                    PaperProps={{
                      className: "min-w-[200px]",
                    }}
                  >
                    <MenuItem onClick={handleProfileClick} className="py-3">
                      <div className="text-sm">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-gray-500">{user.email}</div>
                      </div>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleProfileClick} className="py-2">
                      <PersonIcon
                        className="mr-3 text-gray-500"
                        fontSize="small"
                      />
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleSettingsClick} className="py-2">
                      <SettingsIcon
                        className="mr-3 text-gray-500"
                        fontSize="small"
                      />
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={handleLogout}
                      className="!text-red-600 py-2"
                    >
                      <LogoutIcon className="mr-3" fontSize="small" />
                      Logout
                    </MenuItem>
                  </Menu>
                </div>
              </>
            ) : (
              // --- USER IS LOGGED OUT ---
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outlined"
                className="!font-semibold !shadow-none !border-[#1d4ed8] !text-[#1d4ed8] hover:!bg-blue-50"
                sx={{
                  textTransform: "none",
                }}
              >
                Login / Register
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;