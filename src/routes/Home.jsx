import { Link as ReactRouterLink } from "react-router-dom";
import {
  Button,
  Stack,
  Text,
  Heading,
  Link as ChakraLink,
  StackDivider,
  Flex,
  VStack,
} from "@chakra-ui/react";
import HeaderMain from "../components/HeaderMain";

function Home() {
  return (
    <Flex
      h="100vh"
      direction="column"
      divider={<StackDivider borderColor="gray.200" />}
    >
      <HeaderMain />
      <VStack h="100%" align="center" justify="center" spacing={6}>
        <Heading as="h2" size="2xl" align="center">
          Meet Abe - the Honest 20 Questions Bot
        </Heading>
        <Text fontSize="xl" align="center">
          Unlike ChatGPT and Other LLM&apos;s, He Doesn&apos;t Cheat <br /> Ask Him
          Questions and Try to Deduce What Word He Is Thinking Of
        </Text>
        <Stack spacing={4} direction="row" align="center" justify="center">
          <ChakraLink as={ReactRouterLink} to="/ask">
            <Button colorScheme="teal" size="lg">
              Play
            </Button>
          </ChakraLink>
          {/* To be Implemented later

          <ChakraLink as={ReactRouterLink} to="/answer">
            <Button colorScheme="teal" size="lg">
              Answer
            </Button>
          </ChakraLink>

          */}
        </Stack>
      </VStack>
    </Flex>
  );
}

export default Home;
