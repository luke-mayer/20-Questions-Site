import { Link as ReactRouterLink } from "react-router-dom";
import { FaLinkedinIn } from "react-icons/fa";
import { SiHandshake } from "react-icons/si";
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
        <Heading size="md">Luke Mayer</Heading>
      </Box>
      <ButtonGroup paddingRight="1" gap="2">
        <ChakraLink
          href="https://umd.joinhandshake.com/profiles/50652472"
          isExternal
        >
          <Button p="0" colorScheme="teal">
            <Icon as={SiHandshake} boxSize={7} />
          </Button>
        </ChakraLink>
        <ChakraLink
          href="https://www.linkedin.com/in/luke-mayer-b15908310/"
          isExternal
        >
          <Button p="0" colorScheme="teal">
            <Icon as={FaLinkedinIn} boxSize={7} />
          </Button>
        </ChakraLink>
      </ButtonGroup>
    </Flex>
  );
}

export default HeaderMain;
