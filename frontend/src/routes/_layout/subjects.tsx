import { Container, Flex, Heading, Table } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { type Subject, SubjectService } from "../../client";
import AddSubject from "../../components/Subject/AddSubject";
import PendingUsers from "../../components/Pending/PendingUsers";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";
import SubjectActionsMenu from "../../components/Subject/SubjectActionsMenu";

const subjectsSearchSchema = z.object({
  page: z.number().catch(1),
});

const PER_PAGE = 5;

function getSubjectsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      SubjectService.listSubjects({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
    queryKey: ["subjects", { page }],
  };
}

export const Route = createFileRoute("/_layout/subjects")({
  component: SubjectsAdmin,
  validateSearch: (search) => subjectsSearchSchema.parse(search),
});

function SubjectsTable() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const { page } = Route.useSearch();

  // 获取学科列表
  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getSubjectsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  });

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    });

  const subjects = data ?? [];
  const count = subjects.length;

  if (isLoading) {
    return <PendingUsers />;
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">学科名称</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">学科描述</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">操作</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {subjects?.map((subject: Subject) => (
            <Table.Row key={subject.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell>{subject.name}</Table.Cell>
              <Table.Cell>{subject.description || "-"}</Table.Cell>
              <Table.Cell>
                <SubjectActionsMenu subject={subject} />
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

function SubjectsAdmin() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        学科管理
      </Heading>
      <AddSubject />
      <SubjectsTable />
    </Container>
  );
}
