import { Stack, Text, Link as ChakraLink, Button } from "@chakra-ui/react";
import { Link as ReactRouterLink } from "react-router-dom";

function ErrorMessage() {
  return (
    <Stack
      height="100%"
      align="center"
      justify="center"
      spacing={2}
      fontSize="lg"
    >
      <Text>
        Sorry, something went wrong ;-; . Please return home and try again.
      </Text>
      <ChakraLink as={ReactRouterLink} to="/">
        <Button colorScheme="teal" size="md">
          Home
        </Button>
      </ChakraLink>
    </Stack>
  );
}

export default ErrorMessage;
