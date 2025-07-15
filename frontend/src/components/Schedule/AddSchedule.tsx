import React, { useState } from "react";
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

interface AddScheduleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  teacher_id: string;
  hours: number;
  fee: number;
  remark?: string;
}

export default function AddSchedule({ isOpen, onClose }: AddScheduleProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // 获取教师列表
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => TeacherService.listTeachers(),
  });

  // 创建课表
  const createScheduleMutation = useMutation({
    mutationFn: (data: FormData) =>
      ScheduleService.createScheduleApi({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("课表创建成功");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  const onSubmit = (data: FormData) => {
    createScheduleMutation.mutate(data);
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
            <DialogTitle>添加课表</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>填写课表信息</Text>
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
            <DialogCloseTrigger asChild>
              <Button variant="outline">取消</Button>
            </DialogCloseTrigger>
            <Button
              colorScheme="blue"
              onClick={handleSubmit(onSubmit)}
              loading={createScheduleMutation.isPending}
            >
              {createScheduleMutation.isPending ? "创建中" : "创建课表"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
