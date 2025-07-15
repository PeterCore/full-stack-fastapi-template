import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentService, type Student } from "../../client";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { handleError } from "../../utils";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import { FiEdit2 } from "react-icons/fi";

interface EditStudentProps {
  student: Student;
}

const EditStudent = ({ student }: EditStudentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Student>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: student,
  });

  useEffect(() => {
    reset(student);
  }, [student, reset]);

  const mutation = useMutation({
    mutationFn: (data: Student) =>
      StudentService.updateStudentApi({
        studentId: student.id!,
        requestBody: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsOpen(false);
    },
    onError: (err: any) => {
      handleError(err);
    },
  });

  const onSubmit = (data: Student) => {
    mutation.mutate(data);
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
      size={{ base: "xs", md: "md" }}
      placement="center"
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <FiEdit2 color="#0f766e" style={{ marginRight: 8 }} />
          <span style={{ color: "#0f766e", fontWeight: 600 }}>编辑学生</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>编辑学生</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>修改学生信息。</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="姓名"
              >
                <Input
                  id="name"
                  {...register("name", { required: "姓名是必填项" })}
                  placeholder="请输入姓名"
                  type="text"
                />
              </Field>
              <Field
                required
                invalid={!!errors.genders}
                errorText={errors.genders?.message}
                label="性别"
              >
                <select
                  id="genders"
                  {...register("genders", {
                    required: "请选择性别",
                    valueAsNumber: true,
                  })}
                  style={{
                    width: "100%",
                    padding: "8px 32px 8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">请选择性别</option>
                  <option value={1}>男</option>
                  <option value={0}>女</option>
                </select>
              </Field>
              <Field
                invalid={!!errors.phone}
                errorText={errors.phone?.message}
                label="电话"
              >
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="请输入电话"
                  type="tel"
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
                  placeholder="请输入备注"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.address}
                errorText={errors.address?.message}
                label="地址"
              >
                <Input
                  id="address"
                  {...register("address")}
                  placeholder="请输入地址"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter gap={2}>
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                取消
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              保存
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditStudent;
