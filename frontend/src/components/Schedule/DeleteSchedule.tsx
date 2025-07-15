import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScheduleService } from "../../client";
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

interface DeleteScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  teacherName?: string;
}

export default function DeleteSchedule({
  isOpen,
  onClose,
  scheduleId,
  teacherName,
}: DeleteScheduleProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const deleteScheduleMutation = useMutation({
    mutationFn: () => ScheduleService.deleteScheduleApi({ scheduleId }),
    onSuccess: () => {
      showSuccessToast("课表删除成功");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      onClose();
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  const handleDelete = () => {
    deleteScheduleMutation.mutate();
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
          <DialogTitle>删除课表</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            确定要删除{teacherName ? ` ${teacherName} 的` : ""}
            课表吗？此操作无法撤销。
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogCloseTrigger asChild>
            <Button variant="outline">取消</Button>
          </DialogCloseTrigger>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            loading={deleteScheduleMutation.isPending}
          >
            {deleteScheduleMutation.isPending ? "删除中" : "删除课表"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
