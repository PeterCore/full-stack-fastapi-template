import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import { type Teacher, TeacherService, SubjectService } from "../../client";
import type { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";
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

const AddTeacher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast } = useCustomToast();

  // 获取学科列表（角色就是学科）
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
    defaultValues: {
      name: "",
      remark: "",
      spell_name: "",
      genders: 0,
      phone: "",
      subject_id: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Teacher) =>
      TeacherService.createTeacherApi({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Teacher created successfully.");
      reset();
      setIsOpen(false);
    },
    onError: (err: ApiError) => {
      handleError(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });

  const onSubmit: SubmitHandler<Teacher> = (data) => {
    // 将学科ID同时设置为角色ID和学科ID
    const teacherData = {
      ...data,
      role_id: data.subject_id,
    };
    mutation.mutate(teacherData);
  };

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button value="add-teacher" my={4}>
          <FaPlus fontSize="16px" />
          添加老师
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>添加老师</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new teacher.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="姓名"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required.",
                  })}
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

export default AddTeacher;
