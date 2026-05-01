import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Select,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Member'
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password, formData.role);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Container maxW="lg" py={12} minH="100vh" display="flex" alignItems="center">
      <Card w="100%" boxShadow="xl" borderRadius="lg">
        <CardBody p={8}>
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading size="xl" color="purple.600">
              Create Account
            </Heading>
            <Heading size="md" color="gray.600">Join Task Manager today</Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                size="lg"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                size="lg"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                size="lg"
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    aria-label="Toggle password visibility"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                    aria-label="Toggle password visibility"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="100%"
              isLoading={loading}
              loadingText="Creating account..."
            >
              Register
            </Button>

            <Text color="gray.600">
              Already have an account?{' '}
              <Link as={RouterLink} to="/login" color="purple.500" fontWeight="bold">
                Login
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Register;