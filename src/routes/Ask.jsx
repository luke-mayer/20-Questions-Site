import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import {} from "react";

const data = [
  { q_num: 1, question: "Is it small?", answer: "yes" },
  { q_num: 2, question: "Is it alive?", answer: "no" },
  { q_num: 3, question: "Is it red?", answer: "yes" },
];

const listItems = data.map((item) => (
  <Tr key={item.q_num}>
    <Td isNumeric>{item.q_num}</Td>
    <Td>{item.question}</Td>
    <Td>{item.answer}</Td>
  </Tr>
));

function QuestionTable() {
  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Previous questions and answers</TableCaption>
        <Thead>
          <Tr>
            <Th isnumeric>#</Th>
            <Th>Question</Th>
            <Th>Answer</Th>
          </Tr>
        </Thead>
        <Tbody>{listItems}</Tbody>
      </Table>
    </TableContainer>
  );
}

function Ask() {
  return (
    <Stack height="100vh" align="center" justify="center" spacing={2}>
      <InputGroup size="md" width="400px">
        <Input placeholder="Ask a yes or no question" />
        <InputRightElement width="4.5rem">
          <Button colorScheme="teal" h="1.75rem" size="sm">
            Ask
          </Button>
        </InputRightElement>
      </InputGroup>
      <QuestionTable />
    </Stack>
  );
}

export default Ask;
