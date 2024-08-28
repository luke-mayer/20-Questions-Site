import { Link as ReactRouterLink } from "react-router-dom";
import {
  Button,
  Stack,
  Text,
  Heading,
  Link as ChakraLink,
} from "@chakra-ui/react";

function Home() {
  return (
    <Stack height="100vh" align="center" justify="center" spacing={8}>
      <Heading as="h2" size="2xl">
        Welcome to Honest 20 Questions!
      </Heading>
      <Text fontSize="xl">Would you like to ask or answer the questions?</Text>
      <Stack spacing={4} direction="row" align="center" justify="center">
        <ChakraLink as={ReactRouterLink} to="/ask">
          <Button colorScheme="teal" size="lg">
            Ask
          </Button>
        </ChakraLink>
        <ChakraLink as={ReactRouterLink} to="/answer">
          <Button colorScheme="teal" size="lg">
            Answer
          </Button>
        </ChakraLink>
      </Stack>
    </Stack>
  );
}

export default Home;
