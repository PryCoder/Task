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
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(email, password);
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
              Task Manager
            </Heading>
            <Heading size="md" color="gray.600">Login to your account</Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <FormControl isRequired>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                size="lg"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="100%"
              isLoading={loading}
              loadingText="Logging in..."
            >
              Login
            </Button>

            <Text color="gray.600">
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="purple.500" fontWeight="bold">
                Register
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Login;