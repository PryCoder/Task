import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useBreakpointValue,
  Flex,
  Text,
  IconButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { DeleteIcon, RepeatIcon, ViewIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const gateway =  import.meta.env.VITE_API_URL || '';

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Responsive values
  const headingSize = useBreakpointValue({ base: "xl", sm: "2xl", md: "3xl" });
  const statColumns = useBreakpointValue({ base: 1, sm: 2, md: 4 });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${gateway}/api/admin/stats`),
        axios.get(`${gateway}/api/admin/users`),
        axios.get(`${gateway}/api/admin/projects`),
        axios.get(`${gateway}/api/admin/tasks`)
      ]);
      
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setProjects(projectsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Member' : 'Admin';
    try {
      await axios.put(`${gateway}/api/admin/users/${userId}/role`, { role: newRole });
      toast({ title: 'Success', description: `User role updated to ${newRole}`, status: 'success' });
      fetchAdminData();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update role', status: 'error' });
    }
  };

  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await axios.delete(`${gateway}/api/admin/users/${userId}`);
        toast({ title: 'Success', description: 'User deleted successfully', status: 'success' });
        fetchAdminData();
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete user', status: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box px={{ base: 3, sm: 4, md: 6, lg: 8 }} py={{ base: 4, sm: 5, md: 6, lg: 8 }} minH="100vh">
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size={headingSize} color="purple.600">
              Admin Dashboard
            </Heading>
            <Text color="gray.500" mt={2} fontSize={{ base: "sm", md: "md" }}>
              Welcome back, {user?.name}! Here's your system overview.
            </Text>
          </Box>
        </Flex>

        {/* Stats Grid */}
        <SimpleGrid columns={statColumns} spacing={{ base: 3, md: 4, lg: 6 }} mb={8}>
          <Card bg={cardBg} variant="outline" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "md" }}>Total Users</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="blue.500">
                  {stats?.users?.total || 0}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                  👑 Admins: {stats?.users?.admins || 0} | 👤 Members: {stats?.users?.members || 0}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} variant="outline" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "md" }}>Total Projects</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="green.500">
                  {stats?.projects?.total || 0}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                   New this week: {stats?.projects?.newThisWeek || 0}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} variant="outline" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "md" }}>Total Tasks</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="orange.500">
                  {stats?.tasks?.total || 0}
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                   Completed: {stats?.tasks?.completed || 0}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} variant="outline" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize={{ base: "sm", md: "md" }}>Completion Rate</StatLabel>
                <StatNumber fontSize={{ base: "2xl", md: "3xl" }} color="purple.500">
                  {stats?.tasks?.completionRate || 0}%
                </StatNumber>
                <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                 Overall progress
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Data Tables */}
        <Card bg={cardBg} variant="outline" borderColor={borderColor} overflow="hidden">
          <CardBody p={{ base: 2, sm: 3, md: 4, lg: 5 }}>
            <Tabs variant="soft-rounded" colorScheme="purple" isLazy>
              <TabList 
                overflowX="auto" 
                overflowY="hidden" 
                whiteSpace="nowrap" 
                flexWrap="nowrap"
                sx={{ scrollbarWidth: 'thin' }}
                pb={2}
              >
                <Tab fontSize={{ base: "sm", md: "md" }}> Users ({users.length})</Tab>
                <Tab fontSize={{ base: "sm", md: "md" }}> Projects ({projects.length})</Tab>
                <Tab fontSize={{ base: "sm", md: "md" }}> Tasks ({tasks.length})</Tab>
              </TabList>

              <TabPanels pt={{ base: 3, md: 4 }}>
                {/* Users Tab */}
                <TabPanel p={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Th>Name</Th>
                          {!isMobile && <Th>Email</Th>}
                          <Th>Role</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {users.map((u) => (
                          <Tr key={u._id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                            <Td fontWeight="medium">{u.name}</Td>
                            {!isMobile && <Td>{u.email}</Td>}
                            <Td>
                              <Badge 
                                colorScheme={u.role === 'Admin' ? 'purple' : 'blue'}
                                fontSize={{ base: "xs", md: "sm" }}
                              >
                                {u.role}
                              </Badge>
                            </Td>
                            <Td>
                              <Wrap spacing={2}>
                                <WrapItem>
                                  <Button 
                                    size="xs" 
                                    colorScheme="purple" 
                                    variant="outline"
                                    onClick={() => updateUserRole(u._id, u.role)}
                                    leftIcon={<RepeatIcon />}
                                  >
                                    {isMobile ? '' : 'Toggle Role'}
                                  </Button>
                                </WrapItem>
                                <WrapItem>
                                  <Button 
                                    size="xs" 
                                    colorScheme="red" 
                                    variant="outline"
                                    onClick={() => deleteUser(u._id, u.name)}
                                    leftIcon={<DeleteIcon />}
                                  >
                                    {isMobile ? '' : 'Delete'}
                                  </Button>
                                </WrapItem>
                              </Wrap>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                {/* Projects Tab */}
                <TabPanel p={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Th>Name</Th>
                          <Th>Owner</Th>
                          <Th>Status</Th>
                          <Th>Members</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {projects.map((p) => (
                          <Tr key={p._id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                            <Td fontWeight="medium">{p.name}</Td>
                            <Td>{p.owner?.name || 'N/A'}</Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  p.status === 'Active' ? 'green' : 
                                  p.status === 'Completed' ? 'blue' : 'yellow'
                                }
                              >
                                {p.status}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge colorScheme="gray">{p.teamMembers?.length || 0}</Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
                
                {/* Tasks Tab */}
                <TabPanel p={0}>
                  <Box overflowX="auto">
                    <Table variant="simple" size={tableSize}>
                      <Thead>
                        <Tr bg={useColorModeValue('gray.50', 'gray.700')}>
                          <Th>Title</Th>
                          {!isTablet && <Th>Project</Th>}
                          <Th>Assigned To</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {tasks.map((t) => (
                          <Tr key={t._id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                            <Td fontWeight="medium" maxW="200px" whiteSpace="normal">
                              {t.title}
                            </Td>
                            {!isTablet && <Td>{t.project?.name || 'N/A'}</Td>}
                            <Td>{t.assignedTo?.name || 'Unassigned'}</Td>
                            <Td>
                              <Badge 
                                colorScheme={
                                  t.status === 'Completed' ? 'green' :
                                  t.status === 'In Progress' ? 'blue' :
                                  t.status === 'Overdue' ? 'red' : 'yellow'
                                }
                              >
                                {t.status}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Mobile Summary Card */}
        {isMobile && stats && (
          <Card bg={cardBg} variant="outline" borderColor={borderColor} mt={4}>
            <CardBody>
              <Text fontSize="sm" textAlign="center" color="gray.500">
                📊 {stats?.users?.total || 0} Users | 📁 {stats?.projects?.total || 0} Projects | ✅ {stats?.tasks?.total || 0} Tasks
              </Text>
              <Text fontSize="xs" textAlign="center" color="gray.400" mt={2}>
                {stats?.tasks?.completionRate || 0}% Completion Rate
              </Text>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;