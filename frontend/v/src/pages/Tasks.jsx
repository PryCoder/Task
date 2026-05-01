import React, { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Text,
  Badge,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Divider,
  useColorModeValue,
  Box,
  IconButton,
  Tooltip,
  Tag,
  Wrap,
  WrapItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Avatar,
} from '@chakra-ui/react';
import { ViewIcon, CheckIcon, CloseIcon, RepeatIcon, TimeIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestedStatus, setRequestedStatus] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);
  const { user } = useAuth();
  const toast = useToast();
  const gateway = import.meta.env.VITE_API_URL || '';

  const isAdmin = user?.role === 'Admin';

  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const modalBg = useColorModeValue('white', 'gray.800');
  const alertBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    if (isAdmin) {
      fetchPendingRequests();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${gateway}/api/tasks`);
      setTasks(res.data.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch tasks',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${gateway}/api/tasks/pending-requests`);
      setPendingRequests(res.data.data || []);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${gateway}/api/projects`);
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.assignedTo)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${gateway}/api/tasks`, formData);
      toast({
        title: 'Success',
        description: 'Task created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
      });
      fetchTasks();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openRequestModal = (taskId, currentStatus) => {
    setSelectedTask(taskId);
    setRequestModalOpen(true);
  };

  const openTaskDetail = (task) => {
    setSelectedDetailTask(task);
    setDetailModalOpen(true);
  };

  const submitStatusRequest = async () => {
    if (!requestedStatus) {
      toast({
        title: 'Error',
        description: 'Please select a status',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      await axios.post(`${gateway}/api/tasks/${selectedTask}/request-status`, {
        requestedStatus,
        message: requestMessage
      });
      toast({
        title: 'Request Sent',
        description: `Request to change status to ${requestedStatus} has been sent to admin`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setRequestModalOpen(false);
      setRequestMessage('');
      setRequestedStatus('');
      fetchTasks();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to send request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleApproveRequest = async (taskId) => {
    try {
      await axios.put(`${gateway}/api/tasks/${taskId}/approve-status`, { action: 'approve' });
      toast({
        title: 'Approved',
        description: 'Status change request approved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchTasks();
      fetchPendingRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to approve request',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRejectRequest = async (taskId) => {
    try {
      await axios.put(`${gateway}/api/tasks/${taskId}/approve-status`, { action: 'reject' });
      toast({
        title: 'Rejected',
        description: 'Status change request rejected',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      fetchTasks();
      fetchPendingRequests();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to reject request',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${gateway}/api/tasks/${taskId}/status`, { status });
      toast({
        title: 'Success',
        description: 'Task status updated directly',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      fetchTasks();
      if (detailModalOpen) {
        setDetailModalOpen(false);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update task',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return 'red';
      case 'High': return 'orange';
      case 'Medium': return 'yellow';
      case 'Low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'green';
      case 'In Progress': return 'blue';
      case 'Overdue': return 'red';
      case 'Pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Urgent': return '🔴';
      case 'High': return '🟠';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} textAlign="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text mt={4} color={textColor}>Loading tasks...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg" color={headingColor}>
          Tasks
        </Heading>
        <Button 
          colorScheme="purple" 
          onClick={onOpen}
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          Create Task
        </Button>
      </Flex>

      {/* Admin Pending Requests Section */}
      {isAdmin && pendingRequests.length > 0 && (
        <Box mb={6}>
          <Alert status="warning" borderRadius="md" mb={3}>
            <AlertIcon />
            <Text fontWeight="bold">Pending Status Requests: {pendingRequests.length}</Text>
          </Alert>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {pendingRequests.map((task) => (
              <Card key={task._id} bg="orange.50" variant="outline" borderColor="orange.300">
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Flex justify="space-between">
                      <Text fontWeight="bold">{task.title}</Text>
                      <Badge colorScheme="orange">Request Pending</Badge>
                    </Flex>
                    <Text fontSize="sm">Requested by: {task.statusRequestedBy?.name}</Text>
                    <Text fontSize="sm">Requested status: <Badge colorScheme="blue">{task.requestedStatus}</Badge></Text>
                    <Text fontSize="sm">Message: {task.statusRequestMessage}</Text>
                    <HStack spacing={2} mt={2}>
                      <Button size="sm" colorScheme="green" leftIcon={<CheckIcon />} onClick={() => handleApproveRequest(task._id)}>
                        Approve
                      </Button>
                      <Button size="sm" colorScheme="red" leftIcon={<CloseIcon />} onClick={() => handleRejectRequest(task._id)}>
                        Reject
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {!tasks || tasks.length === 0 ? (
        <Alert status="info" borderRadius="md" bg={alertBg}>
          <AlertIcon />
          No tasks yet. Click "Create Task" to get started!
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {tasks.map((task) => (
            <Card 
              key={task._id} 
              variant="outline" 
              bg={cardBg}
              _hover={{ shadow: 'lg', transform: 'translateY(-4px)', cursor: 'pointer' }}
              transition="all 0.2s"
              onClick={() => openTaskDetail(task)}
            >
              <CardHeader>
                <VStack align="stretch" spacing={2}>
                  <Flex justify="space-between" align="start">
                    <Heading size="md" color={headingColor} noOfLines={1}>
                      {task.title}
                    </Heading>
                    {/* Show different controls for admin vs member */}
                    {isAdmin ? (
                      <Select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateTaskStatus(task._id, e.target.value);
                        }}
                        size="sm"
                        width="120px"
                        ml={2}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </Select>
                    ) : (
                      <Tooltip label="Request Status Change">
                        <Button
                          size="xs"
                          colorScheme="purple"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequestModal(task._id, task.status);
                          }}
                          leftIcon={<RepeatIcon />}
                        >
                          Request
                        </Button>
                      </Tooltip>
                    )}
                  </Flex>
                  <HStack spacing={2}>
                    <Badge 
                      colorScheme={getPriorityColor(task.priority)} 
                      px={2}
                      py={1}
                    >
                      {getPriorityIcon(task.priority)} {task.priority}
                    </Badge>
                    <Badge 
                      colorScheme={getStatusColor(task.status)} 
                      px={2}
                      py={1}
                    >
                      {task.status}
                    </Badge>
                    {task.statusRequestStatus === 'pending' && !isAdmin && (
                      <Badge colorScheme="orange" fontSize="xs">
                        Request Pending
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Text color={textColor} noOfLines={2}>
                    {task.description}
                  </Text>
                  <Divider borderColor={dividerColor} />
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" color={labelColor}>Due Date:</Text>
                    <Text fontSize="sm" color={textColor}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Task Detail Modal - Full Lifecycle View */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} size="xl" isCentered scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg={modalBg} maxH="90vh">
          <ModalHeader color={headingColor}>
            <Flex justify="space-between" align="center">
              <Text>Task Details</Text>
              <Badge colorScheme={getStatusColor(selectedDetailTask?.status)} fontSize="md" px={3} py={1}>
                {selectedDetailTask?.status}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDetailTask && (
              <VStack spacing={6} align="stretch">
                {/* Task Header */}
                <Box>
                  <Heading size="lg" color={headingColor} mb={2}>
                    {selectedDetailTask.title}
                  </Heading>
                  <HStack spacing={3}>
                    <Badge colorScheme={getPriorityColor(selectedDetailTask.priority)} fontSize="md" px={3} py={1}>
                      {getPriorityIcon(selectedDetailTask.priority)} {selectedDetailTask.priority} Priority
                    </Badge>
                    <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                      📁 {selectedDetailTask.project?.name}
                    </Badge>
                  </HStack>
                </Box>

                <Divider />

                {/* Task Description */}
                <Box>
                  <Text fontWeight="bold" color={labelColor} mb={2}>Description</Text>
                  <Text color={textColor}>{selectedDetailTask.description}</Text>
                </Box>

                <Divider />

                {/* Task Information Grid */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color={labelColor} mb={2}>Assigned To</Text>
                    <HStack>
                      <Avatar size="sm" name={selectedDetailTask.assignedTo?.name} bg="purple.500" />
                      <Box>
                        <Text fontWeight="medium">{selectedDetailTask.assignedTo?.name}</Text>
                        <Text fontSize="sm" color="gray.500">{selectedDetailTask.assignedTo?.email}</Text>
                      </Box>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={labelColor} mb={2}>Created By</Text>
                    <HStack>
                      <Avatar size="sm" name={selectedDetailTask.assignedBy?.name} bg="blue.500" />
                      <Box>
                        <Text fontWeight="medium">{selectedDetailTask.assignedBy?.name}</Text>
                        <Text fontSize="sm" color="gray.500">{selectedDetailTask.assignedBy?.email}</Text>
                      </Box>
                    </HStack>
                  </Box>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color={labelColor} mb={2}>
                      <CalendarIcon mr={2} />
                      Due Date
                    </Text>
                    <Text color={textColor}>
                      {new Date(selectedDetailTask.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                    {new Date(selectedDetailTask.dueDate) < new Date() && selectedDetailTask.status !== 'Completed' && (
                      <Badge colorScheme="red" mt={2}>Overdue</Badge>
                    )}
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={labelColor} mb={2}>
                      <TimeIcon mr={2} />
                      Created At
                    </Text>
                    <Text color={textColor}>
                      {new Date(selectedDetailTask.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Box>
                </SimpleGrid>

                {selectedDetailTask.completedAt && (
                  <Box>
                    <Text fontWeight="bold" color={labelColor} mb={2}>Completed At</Text>
                    <Text color={textColor}>
                      {new Date(selectedDetailTask.completedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Box>
                )}

                {/* Status Request Information */}
                {selectedDetailTask.statusRequestStatus === 'pending' && (
                  <Box bg="orange.50" p={4} borderRadius="md">
                    <Text fontWeight="bold" color="orange.700" mb={2}>Pending Status Request</Text>
                    <Text fontSize="sm">Requested by: {selectedDetailTask.statusRequestedBy?.name}</Text>
                    <Text fontSize="sm">Requested status: {selectedDetailTask.requestedStatus}</Text>
                    <Text fontSize="sm">Message: {selectedDetailTask.statusRequestMessage}</Text>
                    <Text fontSize="sm">Requested at: {new Date(selectedDetailTask.statusRequestedAt).toLocaleString()}</Text>
                  </Box>
                )}

                {/* Status Request History (would need separate collection for full history) */}
                <Box>
                  <Text fontWeight="bold" color={labelColor} mb={3}>Task Lifecycle</Text>
                  <VStack spacing={3} align="stretch">
                    <HStack>
                      <Badge colorScheme={selectedDetailTask.status === 'Pending' ? 'yellow' : 'gray'}>Created</Badge>
                      <Text fontSize="sm" color={textColor}>Task was created</Text>
                    </HStack>
                    {selectedDetailTask.status !== 'Pending' && (
                      <HStack>
                        <Badge colorScheme={selectedDetailTask.status === 'In Progress' ? 'blue' : 'gray'}>In Progress</Badge>
                        <Text fontSize="sm" color={textColor}>Work started on task</Text>
                      </HStack>
                    )}
                    {selectedDetailTask.status === 'Completed' && (
                      <HStack>
                        <Badge colorScheme="green">Completed</Badge>
                        <Text fontSize="sm" color={textColor}>Task completed</Text>
                      </HStack>
                    )}
                    {selectedDetailTask.statusRequestStatus === 'pending' && (
                      <HStack>
                        <Badge colorScheme="orange">Request Pending</Badge>
                        <Text fontSize="sm" color={textColor}>Status change requested</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            {isAdmin && selectedDetailTask && (
              <Button colorScheme="purple" onClick={() => {
                setDetailModalOpen(false);
              }}>
                Edit Task
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={headingColor}>Create New Task</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={labelColor}>Title</FormLabel>
                  <Input
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={labelColor}>Description</FormLabel>
                  <Textarea
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={labelColor}>Project</FormLabel>
                  <Select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Select project"
                    focusBorderColor="purple.500"
                  >
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={labelColor}>Assigned To (User Email)</FormLabel>
                  <Input
                    placeholder="Enter user email"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    focusBorderColor="purple.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={labelColor}>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    focusBorderColor="purple.500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color={labelColor}>Due Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    focusBorderColor="purple.500"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="purple" type="submit">
                Create Task
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Request Status Modal */}
      <Modal isOpen={requestModalOpen} onClose={() => setRequestModalOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={headingColor}>Request Status Change</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={labelColor}>Requested Status</FormLabel>
                <Select
                  value={requestedStatus}
                  onChange={(e) => setRequestedStatus(e.target.value)}
                  placeholder="Select status"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel color={labelColor}>Reason for Request</FormLabel>
                <Textarea
                  placeholder="Please explain why you want to change the status..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="purple" onClick={submitStatusRequest}>
              Submit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Tasks;