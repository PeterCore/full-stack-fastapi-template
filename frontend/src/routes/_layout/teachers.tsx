import { Badge, Container, Flex, Heading, Table } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import {
  type Teacher,
  TeacherService,
  SubjectService,
  type Subject,
} from "../../client";
import AddTeacher from "../../components/Teacher/AddTeacher";
import PendingUsers from "../../components/Pending/PendingUsers";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";
import TeacherActionsMenu from "../../components/Teacher/TeacherActionsMenu";

const teachersSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getTeachersQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      TeacherService.listTeachers({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["teachers", { page }],
  };
}

export const Route = createFileRoute("/_layout/teachers")({
  component: TeachersAdmin,
  validateSearch: (search) => teachersSearchSchema.parse(search),
});

function TeachersTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  // 获取老师列表
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getTeachersQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  // 获取所有学科列表（角色就是学科）
  const { data: subjectsData } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => SubjectService.listSubjects(),
  });
  const subjectMap = (subjectsData || []).reduce(
    (acc: Record<string, string>, subject: Subject) => {
      if (subject.id) acc[subject.id] = subject.name;
      return acc;
    },
    {}
  );

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const teachers = data ?? [];
  const count = teachers.length;

  if (isLoading) {
    return <PendingUsers />;
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">姓名</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">学科</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">电话</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {teachers?.map((teacher: Teacher) => (
            <Table.Row key={teacher.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{teacher.name}</Table.Cell>
              <Table.Cell>{subjectMap[teacher.subject_id] || "-"}</Table.Cell>
              <Table.Cell>{teacher.phone || "-"}</Table.Cell>
              <Table.Cell>
                <TeacherActionsMenu teacher={teacher} />
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

function TeachersAdmin() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        老师管理
      </Heading>
      <AddTeacher />
      <TeachersTable />
    </Container>
  );
}
