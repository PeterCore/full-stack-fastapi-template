import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { TeacherService, SubjectService } from "../../client";
import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react";
import type { Teacher } from "../../client";
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

interface EditTeacherProps {
  teacher: Teacher;
}

const EditTeacher = ({ teacher }: EditTeacherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => SubjectService.listSubjects(),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Teacher>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: teacher,
  });

  useEffect(() => {
    reset(teacher);
  }, [teacher, reset]);

  const mutation = useMutation({
    mutationFn: (data: Teacher) =>
      TeacherService.updateTeacherApi({
        teacherId: teacher.id!,
        requestBody: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      setIsOpen(false);
    },
    onError: (err: any) => {
      handleError(err);
    },
  });

  const onSubmit = (data: Teacher) => {
    // 将学科ID同时设置为角色ID和学科ID
    const teacherData = {
      ...data,
      role_id: data.subject_id,
    };
    mutation.mutate(teacherData);
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
          <span style={{ color: "#0f766e", fontWeight: 600 }}>编辑老师</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>编辑</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Edit the details of the teacher.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="姓名"
              >
                <Input
                  id="name"
                  {...register("name", { required: "Name is required." })}
                  placeholder="Teacher name"
                  type="text"
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
                  placeholder="Teacher remark"
                  type="text"
                />
              </Field>
              <Field
                invalid={!!errors.spell_name}
                errorText={errors.spell_name?.message}
                label="简称"
              >
                <Input
                  id="spell_name"
                  {...register("spell_name")}
                  placeholder="Teacher name in pinyin"
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
                label="手机号码"
              >
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="手机号码"
                  type="tel"
                />
              </Field>
              <Field
                required
                invalid={!!errors.subject_id}
                errorText={errors.subject_id?.message}
                label="学科（角色）"
              >
                <select
                  id="subject_id"
                  {...register("subject_id", { required: "请选择学科" })}
                  disabled={subjectsLoading}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: subjectsLoading ? "#f7fafc" : "white",
                  }}
                >
                  <option value="">
                    {subjectsLoading ? "加载中..." : "请选择学科"}
                  </option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
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
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default EditTeacher;
