import { Container, Flex, Heading, Table } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { type Student, StudentService } from "../../client";
import AddStudent from "../../components/Student/AddStudent";
import PendingUsers from "../../components/Pending/PendingUsers";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";
import StudentActionsMenu from "../../components/Student/StudentActionsMenu";

const studentsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getStudentsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      StudentService.listStudents({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["students", { page }],
  };
}

export const Route = createFileRoute("/_layout/students")({
  component: StudentsAdmin,
  validateSearch: (search) => studentsSearchSchema.parse(search),
});

function StudentsTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  // 获取学生列表
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getStudentsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const students = data ?? [];
  const count = students.length;

  if (isLoading) {
    return <PendingUsers />;
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">姓名</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">性别</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">电话</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">地址</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">备注</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {students?.map((student: Student) => (
            <Table.Row key={student.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{student.name}</Table.Cell>
              <Table.Cell>
                {student.genders === 1
                  ? "男"
                  : student.genders === 0
                    ? "女"
                    : "-"}
              </Table.Cell>
              <Table.Cell>{student.phone || "-"}</Table.Cell>
              <Table.Cell>{student.address || "-"}</Table.Cell>
              <Table.Cell>{student.remark || "-"}</Table.Cell>
              <Table.Cell>
                <StudentActionsMenu student={student} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  );
}

function StudentsAdmin() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        学生管理
      </Heading>
      <AddStudent />
      <StudentsTable />
    </Container>
  );
}
