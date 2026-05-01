import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
  Container,
  IconButton,
  useColorMode,
  useDisclosure,
  VStack,
  Collapse,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon, ChevronDownIcon, HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  // Check if user is admin
  const isAdmin = user?.role === 'Admin';

  // Navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '' },
    { name: 'Projects', path: '/projects', icon: '' },
    { name: 'Tasks', path: '/tasks', icon: '' },
  ];

  // Add Admin link if user is admin
  if (isAdmin) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: '⚙️' });
  }

  return (
    <>
      <Box 
        bg={colorMode === 'light' ? 'white' : 'gray.800'} 
        boxShadow="sm" 
        position="sticky" 
        top={0} 
        zIndex={100}
        borderBottom="1px solid"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <Container maxW="container.xl" px={{ base: 3, sm: 4, md: 6 }}>
          <Flex h={16} alignItems="center" justifyContent="space-between">
            {/* Logo/Brand */}
            <Text
              as={RouterLink}
              to="/dashboard"
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, purple.500, pink.500)"
              bgClip="text"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              Task Manager
            </Text>

            {/* Desktop Navigation Links */}
            <HStack spacing={{ base: 2, lg: 4 }} display={{ base: 'none', md: 'flex' }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  as={RouterLink}
                  to={link.path}
                  variant="ghost"
                  colorScheme={link.name === 'Admin' ? 'red' : 'purple'}
                  size="sm"
                  fontSize="md"
                  leftIcon={<span>{link.icon}</span>}
                  _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
                >
                  {link.name}
                </Button>
              ))}
            </HStack>

            {/* Right Side - User Menu & Theme Toggle */}
            <HStack spacing={{ base: 2, sm: 3 }}>
              {/* Theme Toggle Button */}
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                aria-label="Toggle color mode"
                size={{ base: "sm", md: "md" }}
              />

              {/* Desktop User Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                  colorScheme="purple"
                  display={{ base: 'none', md: 'inline-flex' }}
                  size="sm"
                >
                  <HStack spacing={2}>
                    <Avatar
                      size="xs"
                      name={user?.name}
                      bg="purple.500"
                      color="white"
                    />
                    <Box>
                      <Text fontSize="sm" fontWeight="medium">
                        {user?.name?.split(' ')[0]}
                      </Text>
                      <Badge colorScheme={isAdmin ? 'red' : 'purple'} fontSize="xs">
                        {user?.role}
                      </Badge>
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem>
                    <Box>
                      <Text fontWeight="bold">{user?.name}</Text>
                      <Text fontSize="sm" color="gray.500">{user?.email}</Text>
                      <Badge colorScheme={isAdmin ? 'red' : 'purple'} mt={1}>
                        {user?.role}
                      </Badge>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={handleLogout} color="red.500">
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* Mobile Menu Button */}
              <IconButton
                icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                onClick={onOpen}
                variant="ghost"
                aria-label="Open menu"
                display={{ base: 'inline-flex', md: 'none' }}
                size="md"
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Mobile Drawer Menu */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" py={4}>
            <HStack spacing={3}>
              <Avatar
                size="md"
                name={user?.name}
                bg="purple.500"
                color="white"
              />
              <Box>
                <Text fontWeight="bold">{user?.name}</Text>
                <Badge colorScheme={isAdmin ? 'red' : 'purple'} fontSize="xs">
                  {user?.role}
                </Badge>
              </Box>
            </HStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  as={RouterLink}
                  to={link.path}
                  variant="ghost"
                  justifyContent="flex-start"
                  leftIcon={<span style={{ fontSize: '20px' }}>{link.icon}</span>}
                  onClick={onClose}
                  py={6}
                  px={4}
                  borderRadius="none"
                  _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                >
                  {link.name}
                </Button>
              ))}
              
              <Box borderTopWidth="1px" borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'} my={2} />
              
              <Button
                justifyContent="flex-start"
                leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={() => {
                  toggleColorMode();
                  onClose();
                }}
                variant="ghost"
                py={6}
                px={4}
                borderRadius="none"
              >
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              
              <Button
                justifyContent="flex-start"
                leftIcon={<span>🚪</span>}
                onClick={handleLogout}
                colorScheme="red"
                variant="ghost"
                py={6}
                px={4}
                borderRadius="none"
              >
                Logout
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;