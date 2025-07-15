import React, { useState } from "react";
import {
  Button,
  Container,
  Flex,
  Heading,
  Table,
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CourseService } from "../../client";
import { FaPlus } from "react-icons/fa";
import AddCourse from "../../components/Course/AddCourse";
import CourseActionsMenu from "../../components/Course/CourseActionsMenu";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../components/ui/pagination";

const PER_PAGE = 10;

export const Route = createFileRoute("/_layout/courses")({
  component: CoursesPage,
});

function CoursesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", currentPage],
    queryFn: () =>
      CourseService.listCourses({
        skip: (currentPage - 1) * PER_PAGE,
        limit: PER_PAGE,
      }),
  });

  const count = courses.length;

  // 状态映射
  const getStatusBadge = (status: string) => {
    const statusMap = {
      not_started: { color: "gray", text: "未开始" },
      in_progress: { color: "blue", text: "进行中" },
      completed: { color: "green", text: "完成" },
      cancelled: { color: "red", text: "取消" },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      color: "gray",
      text: "未知",
    };
    return <Badge colorScheme={statusInfo.color}>{statusInfo.text}</Badge>;
  };

  // 格式化时间
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxW="full">
      <Flex justify="space-between" align="center" pt={12} pb={6}>
        <Heading size="lg">课程管理</Heading>
        <Button onClick={() => setIsAddOpen(true)} colorScheme="blue">
          <FaPlus style={{ marginRight: "8px" }} />
          添加课程
        </Button>
      </Flex>

      {isLoading ? (
        <div>加载中...</div>
      ) : (
        <>
          <Table.Root size={{ base: "sm", md: "md" }}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>老师/学科</Table.ColumnHeader>
                <Table.ColumnHeader>开始时间</Table.ColumnHeader>
                <Table.ColumnHeader>结束时间</Table.ColumnHeader>
                <Table.ColumnHeader>上课地址</Table.ColumnHeader>
                <Table.ColumnHeader>课程状态</Table.ColumnHeader>
                <Table.ColumnHeader>学生</Table.ColumnHeader>
                <Table.ColumnHeader>备注</Table.ColumnHeader>
                <Table.ColumnHeader>操作</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {courses.map((course) => (
                <Table.Row key={course.id}>
                  <Table.Cell>
                    {course.teacher_name} - {course.subject_name}
                  </Table.Cell>
                  <Table.Cell>{formatDateTime(course.start_time)}</Table.Cell>
                  <Table.Cell>{formatDateTime(course.end_time)}</Table.Cell>
                  <Table.Cell>{course.address}</Table.Cell>
                  <Table.Cell>{getStatusBadge(course.status)}</Table.Cell>
                  <Table.Cell>
                    {course.students?.map((s) => s.name).join(", ") || "-"}
                  </Table.Cell>
                  <Table.Cell>{course.remark || "-"}</Table.Cell>
                  <Table.Cell>
                    <CourseActionsMenu
                      courseId={course.id}
                      teacherName={course.teacher_name || undefined}
                      subjectName={course.subject_name || undefined}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {courses.length === 0 && (
            <div
              style={{ textAlign: "center", color: "#666", padding: "32px 0" }}
            >
              暂无课程数据
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

      <AddCourse isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </Container>
  );
}
