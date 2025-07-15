import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "../ui/dialog";

interface DeleteCourseProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  teacherName?: string;
  subjectName?: string;
}

export default function DeleteCourse({
  isOpen,
  onClose,
  courseId,
  teacherName,
  subjectName,
}: DeleteCourseProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const deleteCourseMutation = useMutation({
    mutationFn: () => CourseService.deleteCourseApi({ courseId }),
    onSuccess: () => {
      showSuccessToast("课程删除成功");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  const handleDelete = () => {
    deleteCourseMutation.mutate();
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "sm" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除课程</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            确定要删除
            {teacherName && subjectName
              ? ` ${teacherName} 的 ${subjectName} 课程`
              : "这个课程"}
            吗？此操作无法撤销。
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button variant="outline">取消</Button>
          </DialogCloseTrigger>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            loading={deleteCourseMutation.isPending}
          >
            {deleteCourseMutation.isPending ? "删除中" : "删除课程"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
