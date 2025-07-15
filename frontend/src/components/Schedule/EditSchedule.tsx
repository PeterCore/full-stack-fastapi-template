import React, { useState, useEffect } from "react";
import { Button, Input, Text, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { ScheduleService, TeacherService } from "../../client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Field } from "../ui/field";

interface EditScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
}

interface FormData {
  teacher_id: string;
  hours: number;
  fee: number;
  remark?: string;
}

export default function EditSchedule({
  isOpen,
  onClose,
  scheduleId,
}: EditScheduleProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // 获取教师列表
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => TeacherService.listTeachers(),
  });

  // 获取课表详情
  const { data: schedule } = useQuery({
    queryKey: ["schedule", scheduleId],
    queryFn: () => ScheduleService.getScheduleApi({ scheduleId }),
    enabled: isOpen && !!scheduleId,
  });

  // 更新课表
  const updateScheduleMutation = useMutation({
    mutationFn: (data: FormData) =>
      ScheduleService.updateScheduleApi({
        scheduleId,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("课表更新成功");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", scheduleId] });
      onClose();
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // 当对话框打开或数据变化时，设置表单初始值
  useEffect(() => {
    if (isOpen && schedule) {
      setValue("teacher_id", schedule.teacher_id);
      setValue("hours", schedule.hours);
      setValue("fee", schedule.fee);
      setValue("remark", schedule.remark || "");
    }
  }, [isOpen, schedule, setValue]);

  const onSubmit = (data: FormData) => {
    updateScheduleMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>编辑课表</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>修改课表信息</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.teacher_id}
                errorText={errors.teacher_id?.message}
                label="选择老师"
              >
                <select
                  id="teacher_id"
                  {...register("teacher_id", { required: "请选择老师" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">请选择老师</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                required
                invalid={!!errors.hours}
                errorText={errors.hours?.message}
                label="课时数"
              >
                <Input
                  id="hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  {...register("hours", {
                    required: "请输入课时数",
                    min: { value: 0.5, message: "课时数不能少于0.5" },
                    valueAsNumber: true,
                  })}
                  placeholder="请输入课时数"
                />
              </Field>

              <Field
                required
                invalid={!!errors.fee}
                errorText={errors.fee?.message}
                label="费用 (元)"
              >
                <Input
                  id="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("fee", {
                    required: "请输入费用",
                    min: { value: 0, message: "费用不能为负数" },
                    valueAsNumber: true,
                  })}
                  placeholder="请输入费用"
                />
              </Field>

              <Field
                invalid={!!errors.remark}
                errorText={errors.remark?.message}
                label="备注"
              >
                <Input
                  id="remark"
                  {...register("remark")}
                  placeholder="可选：添加备注信息"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button
              colorScheme="blue"
              onClick={handleSubmit(onSubmit)}
              loading={updateScheduleMutation.isPending}
            >
              {updateScheduleMutation.isPending ? "更新中" : "更新课表"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
