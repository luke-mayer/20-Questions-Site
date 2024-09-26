import { Link as ReactRouterLink } from "react-router-dom";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Spacer,
  Link as ChakraLink,
  Icon,
} from "@chakra-ui/react";

function HeaderMain() {
  return (
    <Flex paddingTop="2px" minWidth="max-content" alignItems="center" gap="2">
      <Box p="2">
        <Heading size="md">Abe - 20 Questions Bot</Heading>
      </Box>
      <ChakraLink as={ReactRouterLink} to="/">
        <Button colorScheme="teal" size="md">
          Home
        </Button>
      </ChakraLink>
      <Spacer />
      <Box p="2">
        <ChakraLink href="https://lukemayer.com/" isExternal>
          <Heading size="md">Luke Mayer</Heading>
        </ChakraLink>
      </Box>
      <ButtonGroup paddingRight="1">
        <ChakraLink href="https://github.com/luke-mayer" isExternal>
          <Button p="0" colorScheme="teal">
            <Icon as={FaGithub} boxSize={6} />
          </Button>
        </ChakraLink>
        <ChakraLink
          href="https://www.linkedin.com/in/luke-mayer316/"
          isExternal
        >
          <Button p="0" colorScheme="teal">
            <Icon as={FaLinkedinIn} boxSize={6} />
          </Button>
        </ChakraLink>
      </ButtonGroup>
    </Flex>
  );
}

export default HeaderMain;
