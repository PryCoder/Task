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
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  Flex,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: ''
  });
  const { user } = useAuth();
  const toast = useToast();
  const gateway = import.meta.env.VITE_API_URL || '';

  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const labelColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.800');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');
  const modalBg = useColorModeValue('white', 'gray.800');
  const alertBg = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${gateway}/api/projects`);
      setProjects(res.data.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch projects',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${gateway}/api/projects`, formData);
      toast({
        title: 'Success',
        description: 'Project created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setFormData({ name: '', description: '', deadline: '' });
      fetchProjects();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create project',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const addTeamMember = async (projectId) => {
    const memberEmail = prompt('Enter team member email:');
    if (memberEmail) {
      try {
        await axios.put(`${gateway}/api/projects/${projectId}/addmember`, { email: memberEmail });
        toast({
          title: 'Success',
          description: 'Team member added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchProjects();
      } catch (err) {
        toast({
          title: 'Error',
          description: err.response?.data?.error || 'Failed to add team member',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'On Hold': return 'yellow';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8} textAlign="center">
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text mt={4} color={textColor}>Loading projects...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg" color={headingColor}>
          Projects
        </Heading>
        {user?.role === 'Admin' && (
          <Button 
            colorScheme="purple" 
            onClick={onOpen}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            Create Project
          </Button>
        )}
      </Flex>

      {!projects || projects.length === 0 ? (
        <Alert status="info" borderRadius="md" bg={alertBg}>
          <AlertIcon />
          No projects yet. {user?.role === 'Admin' && 'Click "Create Project" to get started!'}
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {projects.map((project) => (
            <Card 
              key={project._id} 
              variant="outline" 
              bg={cardBg}
              _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
              transition="all 0.2s"
            >
              <CardHeader>
                <VStack align="stretch" spacing={2}>
                  <Heading size="md" color={headingColor}>{project.name}</Heading>
                  <Badge 
                    colorScheme={getStatusColor(project.status)} 
                    alignSelf="flex-start"
                    px={2}
                    py={1}
                  >
                    {project.status || 'Active'}
                  </Badge>
                </VStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Text color={textColor} noOfLines={2}>
                    {project.description}
                  </Text>
                  <Divider borderColor={dividerColor} />
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" color={labelColor}>Deadline:</Text>
                    <Text fontSize="sm" color={textColor}>
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" color={labelColor}>Owner:</Text>
                    <Text fontSize="sm" color={textColor}>{project.owner?.name || 'Unknown'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" fontWeight="bold" color={labelColor}>Team Members:</Text>
                    <Text fontSize="sm" color={textColor}>
                      {project.teamMembers?.length || 0}
                    </Text>
                  </HStack>
                  {user?.role === 'Admin' && (
                    <Button 
                      size="sm" 
                      colorScheme="purple" 
                      variant="outline"
                      onClick={() => addTeamMember(project._id)}
                      mt={2}
                    >
                      Add Team Member
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg={modalBg}>
          <ModalHeader color={headingColor}>Create New Project</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color={labelColor}>Project Name</FormLabel>
                  <Input
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    focusBorderColor="purple.500"
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={labelColor}>Description</FormLabel>
                  <Textarea
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    focusBorderColor="purple.500"
                    _placeholder={{ color: useColorModeValue('gray.400', 'gray.500') }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={labelColor}>Deadline</FormLabel>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
                Create Project
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Projects;