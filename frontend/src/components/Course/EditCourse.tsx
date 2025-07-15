import React, { useState, useEffect } from "react";
import { Button, Input, Text, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { CourseService, ScheduleService, StudentService } from "../../client";
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

interface EditCourseProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
}

interface FormData {
  schedule_id: string;
  start_time: string;
  end_time: string;
  address: string;
  status: "not_started" | "in_progress" | "completed" | "cancelled";
  remark?: string;
  student_ids: string[];
}

export default function EditCourse({
  isOpen,
  onClose,
  courseId,
}: EditCourseProps) {
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: "not_started",
      student_ids: [],
    },
  });

  // 获取课表列表
  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => ScheduleService.listSchedules(),
  });

  // 获取学生列表
  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => StudentService.listStudents(),
  });

  // 获取课程详情
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => CourseService.getCourseApi({ courseId }),
    enabled: isOpen && !!courseId,
  });

  // 更新课程
  const updateCourseMutation = useMutation({
    mutationFn: (data: FormData) =>
      CourseService.updateCourseApi({
        courseId,
        requestBody: data,
      }),
    onSuccess: () => {
      showSuccessToast("课程更新成功");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      onClose();
    },
    onError: (error: any) => {
      handleError(error);
    },
  });

  // 当对话框打开或数据变化时，设置表单初始值
  useEffect(() => {
    if (isOpen && course) {
      setValue("schedule_id", course.schedule_id);
      setValue("start_time", course.start_time.replace(" ", "T"));
      setValue("end_time", course.end_time.replace(" ", "T"));
      setValue("address", course.address);
      setValue("status", course.status);
      setValue("remark", course.remark || "");
      setValue("student_ids", course.students?.map((s) => s.id) || []);
    }
  }, [isOpen, course, setValue]);

  const onSubmit = (data: FormData) => {
    // 转换时间格式
    const formattedData = {
      ...data,
      start_time: data.start_time.replace("T", " "),
      end_time: data.end_time.replace("T", " "),
    };
    updateCourseMutation.mutate(formattedData);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleStudentChange = (selectedStudents: string[]) => {
    setValue("student_ids", selectedStudents);
  };

  const selectedStudents = watch("student_ids") || [];

  return (
    <DialogRoot
      size={{ base: "xs", md: "lg" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>编辑课程</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>修改课程信息</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.schedule_id}
                errorText={errors.schedule_id?.message}
                label="选择课表"
              >
                <select
                  {...register("schedule_id", { required: "请选择课表" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">请选择课表</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.teacher_name} - {schedule.subject_name} (
                      {schedule.hours}课时, {schedule.fee}元)
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                required
                invalid={!!errors.start_time}
                errorText={errors.start_time?.message}
                label="开始时间"
              >
                <Input
                  type="datetime-local"
                  {...register("start_time", {
                    required: "请选择开始时间",
                    validate: (value) => {
                      if (new Date(value) <= new Date()) {
                        return "开始时间不能早于当前时间";
                      }
                      return true;
                    },
                  })}
                />
              </Field>

              <Field
                required
                invalid={!!errors.end_time}
                errorText={errors.end_time?.message}
                label="结束时间"
              >
                <Input
                  type="datetime-local"
                  {...register("end_time", {
                    required: "请选择结束时间",
                    validate: (value) => {
                      const startTime = watch("start_time");
                      if (startTime && new Date(value) <= new Date(startTime)) {
                        return "结束时间必须晚于开始时间";
                      }
                      return true;
                    },
                  })}
                />
              </Field>

              <Field
                required
                invalid={!!errors.address}
                errorText={errors.address?.message}
                label="上课地址"
              >
                <Input
                  {...register("address", { required: "请输入上课地址" })}
                  placeholder="请输入上课地址"
                />
              </Field>

              <Field
                required
                invalid={!!errors.status}
                errorText={errors.status?.message}
                label="课程状态"
              >
                <select
                  {...register("status", { required: "请选择课程状态" })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">完成</option>
                  <option value="cancelled">取消</option>
                </select>
              </Field>

              <Field
                invalid={!!errors.student_ids}
                errorText={errors.student_ids?.message}
                label="选择学生"
              >
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    padding: "8px",
                    backgroundColor: "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {students.map((student) => (
                      <label
                        key={student.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f7fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          value={student.id || ""}
                          checked={selectedStudents.includes(student.id || "")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleStudentChange([
                                ...selectedStudents,
                                student.id || "",
                              ]);
                            } else {
                              handleStudentChange(
                                selectedStudents.filter(
                                  (id) => id !== (student.id || "")
                                )
                              );
                            }
                          }}
                          style={{
                            margin: "0",
                            cursor: "pointer",
                          }}
                        />
                        <span style={{ fontSize: "14px" }}>
                          {student.name}{" "}
                          {student.phone ? `(${student.phone})` : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Field>

              <Field
                invalid={!!errors.remark}
                errorText={errors.remark?.message}
                label="备注"
              >
                <Input
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
              loading={updateCourseMutation.isPending}
            >
              {updateCourseMutation.isPending ? "更新中" : "更新课程"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
