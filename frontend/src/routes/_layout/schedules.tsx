import React, { useState } from "react";
import { Button, Container, Flex, Heading, Table } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ScheduleService } from "../../client";
import { FaPlus } from "react-icons/fa";
import AddSchedule from "../../components/Schedule/AddSchedule";
import ScheduleActionsMenu from "../../components/Schedule/ScheduleActionsMenu";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";

const PER_PAGE = 10;

export const Route = createFileRoute("/_layout/schedules")({
  component: SchedulesPage,
});

function SchedulesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules", currentPage],
    queryFn: () =>
      ScheduleService.listSchedules({
        skip: (currentPage - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
  });

  const count = schedules.length;

  return (
    <Container maxW="full">
      <Flex justify="space-between" align="center" pt={12} pb={6}>
        <Heading size="lg">课表管理</Heading>
        <Button onClick={() => setIsAddOpen(true)} colorScheme="blue">
          <FaPlus style={{ marginRight: "8px" }} />
          添加课表
        </Button>
      </Flex>

      {isLoading ? (
        <div>加载中...</div>
      ) : (
        <>
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>老师姓名</Table.ColumnHeader>
                <Table.ColumnHeader>学科</Table.ColumnHeader>
                <Table.ColumnHeader>课时数</Table.ColumnHeader>
                <Table.ColumnHeader>费用 (课时/元)</Table.ColumnHeader>
                <Table.ColumnHeader>备注</Table.ColumnHeader>
                <Table.ColumnHeader>操作</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {schedules.map((schedule) => (
                <Table.Row key={schedule.id}>
                  <Table.Cell>{schedule.teacher_name || "未知"}</Table.Cell>
                  <Table.Cell>{schedule.subject_name || "未知"}</Table.Cell>
                  <Table.Cell>{schedule.hours}</Table.Cell>
                  <Table.Cell>{schedule.fee}</Table.Cell>
                  <Table.Cell>{schedule.remark || "-"}</Table.Cell>
                  <Table.Cell>
                    <ScheduleActionsMenu
                      scheduleId={schedule.id}
                      teacherName={schedule.teacher_name || undefined}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {schedules.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#666", padding: "32px 0" }}
            >
              暂无课表数据
            </div>
          )}

          {count > PER_PAGE && (
            <Flex justifyContent="flex-end" mt={4}>
              <PaginationRoot
                count={count}
                pageSize={PER_PAGE}
                onPageChange={({ page }) => setCurrentPage(page)}
              >
                <Flex>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </Flex>
              </PaginationRoot>
            </Flex>
          )}
        </>
      )}

      <AddSchedule isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </Container>
  );
}
