/* eslint-disable react/prop-types */
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";

function QuestionTable({ messages }) {
  const listItems = messages.map((item) => (
    <Tr key={item.q_num}>
      <Td isNumeric>{item.q_num}</Td>
      <Td>{item.question}</Td>
      <Td>{item.answer}</Td>
    </Tr>
  ));

  return (
    <TableContainer overflowY="auto" height="50%" maxWidth="80%">
      <Table variant="simple">
        <TableCaption>Previous questions and answers</TableCaption>
        <Thead>
          <Tr>
            <Th isNumeric>#</Th>
            <Th>Question</Th>
            <Th>Answer</Th>
          </Tr>
        </Thead>
        <Tbody>{listItems}</Tbody>
      </Table>
    </TableContainer>
  );
}

export default QuestionTable;
