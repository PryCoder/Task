import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  HStack,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const gateway =  import.meta.env.VITE_API_URL || '';
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${gateway}/api/tasks/dashboard`);
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to load dashboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setStats({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        tasksByPriority: { Low: 0, Medium: 0, High: 0, Urgent: 0 },
        recentTasks: [],
        completionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Tasks', value: stats?.totalTasks || 0, color: 'blue' },
    { label: 'Completed', value: stats?.completedTasks || 0, color: 'green' },
    { label: 'In Progress', value: stats?.inProgressTasks || 0, color: 'orange' },
    { label: 'Pending', value: stats?.pendingTasks || 0, color: 'yellow' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, color: 'red' },
    { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, color: 'purple' },
  ];

  const priorityColors = {
    Low: 'green',
    Medium: 'yellow',
    High: 'orange',
    Urgent: 'red'
  };

  const statusColors = {
    Completed: 'green',
    'In Progress': 'blue',
    Pending: 'yellow',
    Overdue: 'red'
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text ml={4} color="gray.600">Loading dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" px={{ base: 3, md: 6, lg: 8 }} py={6}>
      <VStack spacing={6} align="stretch" maxW="1400px" mx="auto">
        {/* Welcome Section */}
        <Box>
          <Heading size="lg" color="gray.800">
            Welcome back, {user?.name}! 👋
          </Heading>
          <Text color="gray.500" mt={2}>
            Here's your task overview
          </Text>
        </Box>

        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing={4}>
          {statCards.map((stat) => (
            <Card key={stat.label} variant="outline" _hover={{ shadow: 'md' }}>
              <CardBody>
                <Stat>
                  <StatLabel fontWeight="bold" color="gray.600">{stat.label}</StatLabel>
                  <StatNumber color={`${stat.color}.500`} fontSize="2xl">
                    {stat.value}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Tasks by Priority Section */}
        <Card variant="outline">
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Tasks by Priority</Heading>
            {stats?.tasksByPriority && Object.keys(stats.tasksByPriority).length > 0 ? (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                  <Box 
                    key={priority} 
                    p={4} 
                    bg={`${priorityColors[priority] || 'gray'}.50`} 
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontWeight="bold" color={`${priorityColors[priority] || 'gray'}.700`}>
                      {priority}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${priorityColors[priority] || 'gray'}.600`}>
                      {count}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text color="gray.500" textAlign="center">No tasks yet</Text>
            )}
          </CardBody>
        </Card>

        {/* Overall Progress */}
        <Card variant="outline">
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Overall Progress</Heading>
            <Box textAlign="center" mb={2}>
              <Text fontSize="3xl" fontWeight="bold" color="purple.600">
                {stats?.completionRate || 0}%
              </Text>
              <Text color="gray.500">Tasks Completed</Text>
            </Box>
            <Progress
              value={stats?.completionRate || 0}
              colorScheme="purple"
              borderRadius="full"
              size="lg"
              bg="purple.100"
            />
          </CardBody>
        </Card>

        {/* Recent Tasks Section */}
        <Card variant="outline">
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Recent Tasks</Heading>
            {stats?.recentTasks && stats.recentTasks.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Task Title</Th>
                      <Th>Status</Th>
                      <Th>Priority</Th>
                      <Th>Due Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {stats.recentTasks.map((task) => (
                      <Tr key={task._id} _hover={{ bg: 'gray.50' }}>
                        <Td fontWeight="medium">{task.title}</Td>
                        <Td>
                          <Badge colorScheme={statusColors[task.status] || 'gray'} px={2} py={1}>
                            {task.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={priorityColors[task.priority] || 'gray'} variant="outline" px={2} py={1}>
                            {task.priority}
                          </Badge>
                        </Td>
                        <Td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                No tasks yet. Create your first task!
              </Alert>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Dashboard;